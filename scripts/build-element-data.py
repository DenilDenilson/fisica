"""Build the checked-in factual catalogue from the PubChem snapshot and RSC audit."""
import json
from pathlib import Path
raw=json.loads(Path('/tmp/fisica-periodic.json').read_text())['Table']
rows=[dict(zip(raw['Columns']['Column'],r['Cell'])) for r in raw['Row']]
names='Hidrógeno Helio Litio Berilio Boro Carbono Nitrógeno Oxígeno Flúor Neón Sodio Magnesio Aluminio Silicio Fósforo Azufre Cloro Argón Potasio Calcio Escandio Titanio Vanadio Cromo Manganeso Hierro Cobalto Níquel Cobre Zinc Galio Germanio Arsénico Selenio Bromo Kriptón Rubidio Estroncio Itrio Circonio Niobio Molibdeno Tecnecio Rutenio Rodio Paladio Plata Cadmio Indio Estaño Antimonio Telurio Yodo Xenón Cesio Bario Lantano Cerio Praseodimio Neodimio Prometio Samario Europio Gadolinio Terbio Disprosio Holmio Erbio Tulio Iterbio Lutecio Hafnio Tantalio Wolframio Renio Osmio Iridio Platino Oro Mercurio Talio Plomo Bismuto Polonio Astato Radón Francio Radio Actinio Torio Protactinio Uranio Neptunio Plutonio Americio Curio Berkelio Californio Einsteinio Fermio Mendelevio Nobelio Lawrencio Rutherfordio Dubnio Seaborgio Bohrio Hassio Meitnerio Darmstatio Roentgenio Copernicio Nihonio Flerovio Moscovio Livermorio Teneso Oganesón'.split()
assert len(names)==118
# Colours describe selected bulk forms, never CPK atomic colours or emission spectra.
colors={1:'#dbe5e8',2:'#dbe5e8',3:'#b5b9bc',4:'#b8c0c3',5:'#423a33',6:'#26282b',7:'#dbe5e8',8:'#dbe5e8',9:'#d7d28a',10:'#dbe5e8',11:'#c6c9cb',12:'#bdc6ce',13:'#c4ccd0',14:'#59636d',15:'#9b3028',16:'#e7c52b',17:'#b0bc46',18:'#dbe5e8',19:'#b8bcc5',20:'#b3b6b0',22:'#9fa7b0',23:'#aab2ba',24:'#cbd2dc',25:'#a0a4a6',26:'#899096',27:'#949ca5',28:'#bec2bc',29:'#bd633a',30:'#a7b5c0',31:'#bdc6cc',32:'#828b92',33:'#707782',34:'#66616a',35:'#6e160c',36:'#dbe5e8',37:'#c0c4c8',38:'#c3c4b3',46:'#c5c8ca',47:'#d9dde0',48:'#bcc4c6',49:'#b9c2c8',50:'#c6c9cb',51:'#a2a9ad',52:'#9ea4a7',53:'#342c3e',54:'#dbe5e8',55:'#c8b270',56:'#b9bab0',60:'#bfc0be',74:'#91969b',75:'#babdc0',76:'#8c9aa8',77:'#c1c4c6',78:'#c5c5c1',79:'#e0ac42',80:'#c7d1da',81:'#a9adb2',82:'#737c89',83:'#c5aa9f',84:'#aaaeb5',86:'#dbe5e8',90:'#afb3b5',92:'#868e91',94:'#8b9095'}
forms={5:'Boro cristalino β-romboédrico',6:'Grafito hexagonal (carbono)',14:'Silicio cristalino',15:'Fósforo rojo',16:'Azufre α ortorrómbico (S₈)',32:'Germanio cristalino',33:'Arsénico gris',34:'Selenio gris trigonal',50:'Estaño β (blanco)',51:'Antimonio romboédrico',52:'Telurio trigonal',53:'Cristal molecular de I₂',83:'Bismuto sin capa de óxido'}
family={'Nonmetal':'No metales','Noble gas':'Gases nobles','Alkali metal':'Alcalinos','Alkaline earth metal':'Alcalinotérreos','Metalloid':'Metaloides','Halogen':'Halógenos','Transition metal':'Metales de transición','Post-transition metal':'Metales postransición','Lanthanide':'Lantánidos','Actinide':'Actínidos'}
audit={r['number']:r for r in json.loads(Path('/tmp/fisica-rsc-audit.json').read_text())}
output=[]
for row,name in zip(rows,names):
 z=int(row['AtomicNumber']); symbol=row['Symbol']; unknown=z>=99 or z in [85,87]
 state='desconocido' if unknown else 'gas' if z in [1,2,7,8,9,10,17,18,36,54,86] else 'líquido' if z in [35,80] else 'sólido'
 evidence='conceptual' if unknown else 'aproximada' if z>=97 else 'documentada'
 def value(key):
  s=row[key]
  try:return float(s)
  except:return None
 # Properties for elements without bulk specimens are withheld, not reported as measurements.
 melt=None if unknown else value('MeltingPoint'); boil=None if unknown else value('BoilingPoint')
 density=None if unknown else value('Density')
 gas_note=''
 if state=='gas':
  density=round(float(row['AtomicMass'])*(2 if z in [1,7,8,9,17] else 1)/24.4654/1000,7)
  gas_note='Densidad calculada con el gas ideal a 25 °C y 1 atm; se usa la masa molecular cuando procede.'
 color=colors.get(z,'#b7bdc2')
 kind='unknown' if unknown else 'gas' if state=='gas' else 'mercury' if z==80 else 'liquid' if z==35 else 'graphite' if z==6 else 'crystal' if z in [5,14,16,32,33,34,51,52,53,83] else 'metal'
 if z==15:kind='powder'
 if z==5:kind='crystal'
 form=forms.get(z, 'Gas molecular' if z in [1,7,8,9,17] else 'Gas monoatómico' if state=='gas' else 'Líquido elemental' if state=='líquido' else 'Metal elemental')
 if unknown:form='Sin muestra macroscópica observada'
 appearance=('No se muestra una supuesta muestra real: su apariencia macroscópica no está establecida.' if unknown else 'Volumen ilustrativo de un gas incoloro; su opacidad se exagera para localizarlo.' if state=='gas' and z not in [9,17] else 'Gas amarillo pálido; el volumen representado es ilustrativo.' if z==9 else 'Gas amarillo verdoso; no representa luz de descarga.' if z==17 else 'Líquido rojizo oscuro, con volumen y superficie libre.' if z==35 else 'Líquido metálico plateado, con una superficie de alta tensión.' if z==80 else 'Fragmento metálico amarillo dorado, sin óxido ni recubrimientos.' if z==79 else 'Fragmento metálico rojizo cobrizo, sin pátina de oxidación.' if z==29 else 'Láminas oscuras de grafito; no representa diamante.' if z==6 else 'Cristales amarillos de azufre ortorrómbico.' if z==16 else 'Fragmento cristalino gris oscuro de brillo metálico.' if z==14 else 'Fragmento de '+form.lower()+'. Geometría procedural orientativa; no es un escaneo de una muestra.')
 output.append({'number':z,'symbol':symbol,'name':name,'englishName':row['Name'],'mass':row['AtomicMass'],'family':family.get(row['GroupBlock'],row['GroupBlock']),'state':state,'evidence':evidence,'form':form,'appearance':appearance,'density':density,'densityNote':gas_note or 'Valor de referencia de PubChem; temperatura y fase de medida según la fuente, no corregido a 25 °C.','meltingK':melt,'boilingK':boil,'propertyNote':'Se omiten valores predichos o sin muestra macroscópica.' if unknown else 'Valores de referencia de PubChem; pueden depender del alótropo. Carbono y arsénico subliman a 1 atm.' if z in [6,33] else 'Valores de referencia de PubChem.','visual':{'kind':kind,'color':color,'metalness':0 if kind in ['gas','unknown','crystal','powder'] and z not in [14,32,33,34,51,52,83] else 1,'roughness':0.12 if z in [79,47,78] else 0.06 if z==80 else 0.5 if z==6 else 0.28},'sources':[{'title':'PubChem · '+row['Name'],'url':'https://pubchem.ncbi.nlm.nih.gov/element/'+row['Name']},{'title':'Royal Society of Chemistry · '+row['Name'],'url':audit[z]['url']}],'rscChecked':audit[z]['retrieved'] and bool(audit[z]['appearance'])})
Path('src/elements/elements.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
print('Generated',len(output),'elements. RSC checked:',sum(e['rscChecked'] for e in output))
