// Real A La Carte Menu Data for Wijayasiri Fresh Food
export const wijayasiriMenuData = [
  // SOUPS
  { code: '4001', name: 'Vegetable Soup', category: 'Soups', price: 400, description: 'Fresh seasonal vegetables cooked in a light, seasoned broth.' },
  { code: '4002', name: 'Chicken with Egg Drop', category: 'Soups', price: 450, description: 'Wispy beaten eggs in a flavorful chicken broth with chicken chunks.' },
  { code: '4003', name: 'Hot & Sour Chicken Soup', category: 'Soups', price: 500, description: 'Spicy and tangy soup loaded with chicken, bamboo shoots, and mushrooms.' },
  { code: '4004', name: 'Tom Yam Seafood Soup', category: 'Soups', price: 550, description: 'Traditional Thai spicy and sour soup with mixed fresh seafood and herbs.' },
  { code: '4007', name: 'Cream of Mushroom Soup', category: 'Soups', price: 850, description: 'Rich, smooth cream soup loaded with sauteed button mushrooms.' },

  // SALADS
  { code: '4010', name: 'Coleslaw Salad', category: 'Salads', price: 750, description: 'Shredded cabbage and carrots tossed in a rich, creamy mayonnaise dressing.' },
  { code: '4011', name: 'Tomato Onion Salad', category: 'Salads', price: 650, description: 'Sliced fresh tomatoes and sharp onions seasoned with lime and salt.' },
  { code: '4013', name: 'Chicken Salad', category: 'Salads', price: 850, description: 'Tender grilled chicken pieces tossed with fresh greens and herb dressing.' },
  { code: '4014', name: 'Fish Salad', category: 'Salads', price: 850, description: 'Flaky seasoned fish fillet combined with crisp lettuce and citrus dressing.' },
  { code: '4015', name: 'Mixed Vegetable Salad', category: 'Salads', price: 750, description: 'A crisp selection of fresh garden vegetables dressed in olive oil.' },

  // FRIED RICE - KEERI SAMBA
  { code: 'R1', name: 'Vegetable Fried Rice', category: 'Fried Rice', sizes: { small: 650, large: 950 }, description: 'Premium Keeri Samba rice stir-fried with fresh garden vegetables.' },
  { code: 'R2', name: 'Egg Fried Rice', category: 'Fried Rice', sizes: { small: 700, large: 1100 }, description: 'Classic wok-tossed Keeri Samba rice with scrambled eggs and scallions.' },
  { code: 'R3', name: 'Chicken Fried Rice', category: 'Fried Rice', sizes: { small: 800, large: 1300 }, description: 'Savory fried rice cooked with tender pieces of seasoned chicken.' },
  { code: 'R4', name: 'Fish Fried Rice', category: 'Fried Rice', sizes: { small: 800, large: 1300 }, description: 'Flavorful Samba rice stir-fried with seasoned fish flakes and veggies.' },
  { code: 'R5', name: 'Seafood Fried Rice', category: 'Fried Rice', sizes: { small: 1000, large: 1500 }, description: 'Deluxe fried rice loaded with prawns, cuttlefish, and fish.' },
  { code: 'R6', name: 'Mixed Fried Rice', category: 'Fried Rice', sizes: { small: 1100, large: 1700 }, description: 'Stir-fried rice with a rich combination of chicken, egg, and seafood.' },
  { code: 'R7', name: 'Nasiguran Mixed Rice', category: 'Fried Rice', sizes: { small: 1200, large: 1800 }, description: 'Indonesian-style spicy fried rice topped with fried egg and garnishes.' },
  { code: 'R8', name: 'Mongolian Seafood Rice', category: 'Fried Rice', sizes: { small: 1100, large: 1600 }, description: 'Spicy, wok-hefted Mongolian style rice stir-fried with mixed seafood.' },
  { code: 'R9', name: 'Bacon & Egg Fried Rice', category: 'Fried Rice', sizes: { small: 1300, large: 2000 }, description: 'Smoky pork bacon and scrambled egg tossed with premium Keeri Samba rice.' },
  { code: '4042', name: 'Special Chicken Kebab Rice', category: 'Fried Rice', price: 2700, description: 'House special aromatic rice served with grilled chicken kebabs.' },
  { code: '4048', name: 'Special Jambo Nasi', category: 'Fried Rice', price: 3700, description: 'Grand portion of Indonesian Nasi Goreng with satay, fried chicken, and egg.' },
  { code: '4047', name: 'Special Family Combo', category: 'Fried Rice', price: 5300, description: 'Massive platter of mixed fried rice with assorted side dishes, serves 4-5.' },

  // NOODLES
  { code: 'N1', name: 'Vegetable Noodles', category: 'Noodles', sizes: { small: 650, large: 950 }, description: 'Wok-tossed noodles with a fresh assortment of shredded vegetables.' },
  { code: 'N2', name: 'Egg Noodles', category: 'Noodles', sizes: { small: 700, large: 1100 }, description: 'Simple and delicious noodles stir-fried with scrambled eggs.' },
  { code: 'N3', name: 'Chicken Noodles', category: 'Noodles', sizes: { small: 800, large: 1300 }, description: 'Flavorful stir-fried noodles with tender pieces of marinated chicken.' },
  { code: 'N4', name: 'Fish Noodles', category: 'Noodles', sizes: { small: 800, large: 1300 }, description: 'Stir-fried noodles with shredded fish flakes and seasonal vegetables.' },
  { code: 'N5', name: 'Seafood Noodles', category: 'Noodles', sizes: { small: 1000, large: 1500 }, description: 'Noodles tossed in high heat with fresh prawns, fish, and cuttlefish.' },
  { code: 'N6', name: 'Mixed Noodles', category: 'Noodles', sizes: { small: 1100, large: 1700 }, description: 'A rich combination of chicken, seafood, and egg tossed with noodles.' },
  { code: '4095', name: 'Chilli Ginger Chicken Noodles', category: 'Noodles', price: 1400, description: 'Spicy noodles flavored with freshly minced ginger and fiery chillies.' },
  { code: '4096', name: 'Garlic Prawns Noodles', category: 'Noodles', price: 1500, description: 'Premium noodles cooked with butter, garlic, and succulent prawns.' },

  // CHOP SUEY RICE / NOODLES
  { code: 'CSR1', name: 'Vegetable Chop Suey Rice', category: 'Chop Suey', sizes: { small: 1050, large: 1450 }, description: 'Crispy stir-fried vegetables in a thick glaze served over steamed rice.' },
  { code: 'CSR2', name: 'Chicken Chop Suey Rice', category: 'Chop Suey', sizes: { small: 1400, large: 1900 }, description: 'Tender chicken strips and vegetables in thick sauce served over rice.' },
  { code: 'CSR3', name: 'Fish Chop Suey Rice', category: 'Chop Suey', sizes: { small: 1400, large: 1900 }, description: 'Crisp fish pieces and mixed vegetables in white sauce served over rice.' },
  { code: 'CSR4', name: 'Seafood Chop Suey Rice', category: 'Chop Suey', sizes: { small: 1500, large: 2000 }, description: 'Succulent mixed seafood and vegetables in thick gravy served over rice.' },
  { code: 'CSR5', name: 'Mixed Chop Suey Rice', category: 'Chop Suey', sizes: { small: 1700, large: 2200 }, description: 'Premium assortment of meat, seafood, and vegetables served over rice.' },
  { code: 'CSN1', name: 'Vegetable Chop Suey Noodles', category: 'Chop Suey', sizes: { small: 1050, large: 1450 }, description: 'Crispy pan-fried noodles topped with stir-fried vegetables in gravy.' },
  { code: 'CSN2', name: 'Chicken Chop Suey Noodles', category: 'Chop Suey', sizes: { small: 1400, large: 1900 }, description: 'Stir-fried chicken and vegetables in thick glaze poured over crispy noodles.' },
  { code: 'CSN3', name: 'Fish Chop Suey Noodles', category: 'Chop Suey', sizes: { small: 1400, large: 1900 }, description: 'Tender fish pieces and vegetables served on top of wok-fried noodles.' },
  { code: 'CSN4', name: 'Seafood Chop Suey Noodles', category: 'Chop Suey', sizes: { small: 1500, large: 2000 }, description: 'Fresh prawns, fish, and cuttlefish in thick white glaze over crispy noodles.' },
  { code: 'CSN5', name: 'Mixed Chop Suey Noodles', category: 'Chop Suey', sizes: { small: 1700, large: 2200 }, description: 'Assorted meats and seafood with vegetables in premium glaze over noodles.' },

  // KOTTU
  { code: 'K1', name: 'Vegetable Kottu', category: 'Kottu', sizes: { small: 550, large: 750 }, description: 'Shredded parotta griddle-tossed with fresh vegetables and aromatic spices.' },
  { code: 'K2', name: 'Egg Kottu', category: 'Kottu', sizes: { small: 600, large: 800 }, description: 'Classic street style kottu prepared with parotta, egg, and chopped vegetables.' },
  { code: 'K3', name: 'Fish Kottu', category: 'Kottu', sizes: { small: 650, large: 950 }, description: 'Spicy shredded parotta stir-fried with seasoned fish chunks and curry.' },
  { code: 'K4', name: 'Roast Chicken Kottu', category: 'Kottu', sizes: { small: 650, large: 950 }, description: 'House favorite Kottu made with shredded roasted chicken and spicy gravy.' },
  { code: 'K5', name: 'Seafood Kottu', category: 'Kottu', sizes: { small: 900, large: 1250 }, description: 'A fiery mix of prawns, cuttlefish, and fish chopped on the griddle with parotta.' },
  { code: 'K6', name: 'Mixed Kottu', category: 'Kottu', sizes: { small: 1050, large: 1450 }, description: 'Combined griddle-tossed parotta with chicken, seafood, egg, and spices.' },
  { code: 'K7', name: 'Pork Kottu', category: 'Kottu', sizes: { small: 800, large: 1150 }, description: 'Shredded parotta tossed with savory pork cubes and rich gravy.' },
  { code: 'K8', name: 'Mutton Kottu', category: 'Kottu', sizes: { small: 1550, large: 2550 }, description: 'Tender boneless mutton pieces chopped with parotta and highly spiced curry.' },
  { code: 'K9', name: 'Egg Cheese Kottu', category: 'Kottu', sizes: { small: 900, large: 1250 }, description: 'Scrambled eggs and melted cheese folded into chopped hot parotta.' },
  { code: 'K10', name: 'Cheese Kottu with Mayo', category: 'Kottu', sizes: { small: 1000, large: 1450 }, description: 'Super creamy kottu with melted cheese and rich garlic mayonnaise.' },
  { code: 'K11', name: 'Cheese Chicken Kottu', category: 'Kottu', sizes: { small: 1050, large: 1550 }, description: 'Shredded roast chicken and creamy melted cheese tossed with chopped parotta.' },

  // KOTTU - STRING HOPPERS
  { code: 'SH1', name: 'Vegetable String Hopper Kottu', category: 'String Hopper Kottu', sizes: { small: 550, large: 750 }, description: 'Shredded string hoppers griddle-tossed with fresh vegetables and spices.' },
  { code: 'SH2', name: 'Egg String Hopper Kottu', category: 'String Hopper Kottu', sizes: { small: 600, large: 800 }, description: 'Light string hoppers chopped with fresh eggs and mild spices.' },
  { code: 'SH3', name: 'Fish String Hopper Kottu', category: 'String Hopper Kottu', sizes: { small: 650, large: 950 }, description: 'String hoppers griddle-fried with seasoned fish flakes and curry.' },
  { code: 'SH4', name: 'Roast Chicken String Hopper Kottu', category: 'String Hopper Kottu', sizes: { small: 650, large: 950 }, description: 'Delicious string hoppers tossed with roasted chicken pieces and rich gravy.' },
  { code: 'SH5', name: 'Seafood String Hopper Kottu', category: 'String Hopper Kottu', sizes: { small: 900, large: 1250 }, description: 'Mixed seafood griddle-fried with light string hoppers and spices.' },
  { code: 'SH6', name: 'Mixed String Hopper Kottu', category: 'String Hopper Kottu', sizes: { small: 1050, large: 1450 }, description: 'String hoppers tossed with chicken, seafood, egg, and local spices.' },
  { code: 'SH7', name: 'Pork String Hopper Kottu', category: 'String Hopper Kottu', sizes: { small: 800, large: 1150 }, description: 'Shredded string hoppers tossed with tender pork pieces and savory gravy.' },
  { code: 'SH8', name: 'Mutton String Hopper Kottu', category: 'String Hopper Kottu', sizes: { small: 1550, large: 2550 }, description: 'String hoppers griddle-tossed with boneless mutton and deep curry spices.' },

  // PASTA & SPAGHETTI
  { code: '4224', name: 'Cheesy Spaghetti', category: 'Pasta & Spaghetti', price: 1200, description: 'Spaghetti tossed in a rich, velvety cheese sauce and herbs.' },
  { code: '4225', name: 'Chicken Cheese Spaghetti', category: 'Pasta & Spaghetti', price: 1500, description: 'Tender chicken chunks and spaghetti baked in a bubbly cheese cream.' },
  { code: '4220', name: 'Seafood Spaghetti Marinara', category: 'Pasta & Spaghetti', price: 1600, description: 'Spaghetti with mixed seafood simmered in a robust herb-tomato sauce.' },
  { code: '4221', name: 'Spaghetti Carbonara with Bacon (Pork)', category: 'Pasta & Spaghetti', price: 1600, description: 'Spaghetti in creamy egg and parmesan sauce with crispy bacon bits.' },
  { code: '4226', name: 'Cheesy Pasta', category: 'Pasta & Spaghetti', price: 1200, description: 'Penne pasta baked in a smooth, thick three-cheese cream.' },
  { code: '4222', name: 'Chicken Cheese Pasta', category: 'Pasta & Spaghetti', price: 1500, description: 'Sauteed chicken strips and penne tossed in rich parmesan cream.' },
  { code: '4223', name: 'Sri Lankan Style Chicken Pasta', category: 'Pasta & Spaghetti', price: 1200, description: 'Spicy penne pasta tossed with local devilled chicken and peppers.' },
  { code: '4227', name: 'Seafood Cheese Pasta', category: 'Pasta & Spaghetti', price: 1600, description: 'Penne and assorted seafood folded into a creamy mozzarella sauce.' },

  // VEGETABLE DISHES
  { code: '4100', name: 'Vegetable Chop Suey', category: 'Vegetable Dishes', price: 950, description: 'A crisp combination of stir-fried seasonal vegetables in light soy glaze.' },
  { code: '4101', name: 'Hot Butter Mushroom', category: 'Vegetable Dishes', price: 950, description: 'Crispy fried button mushrooms tossed in butter, spring onions, and dry chillies.' },
  { code: '4102', name: 'Boiled Vegetable', category: 'Vegetable Dishes', price: 950, description: 'Lightly steamed seasonal garden vegetables seasoned with butter.' },
  { code: '4105', name: 'Devilled Mushroom', category: 'Vegetable Dishes', price: 950, description: 'Button mushrooms stir-fried in a spicy, sweet-sour Sri Lankan devilled sauce.' },
  { code: '4107', name: 'Hot Butter Baby Corn', category: 'Vegetable Dishes', price: 950, description: 'Crisp-fried baby corn spears tossed in butter, garlic, and chilli flakes.' },
  { code: '4109', name: 'Kadala Masala', category: 'Vegetable Dishes', price: 750, description: 'Soft boiled chickpeas simmered in a thick, highly seasoned onion-tomato gravy.' },
  { code: '4111', name: 'Vegetable Pakora', category: 'Vegetable Dishes', price: 850, description: 'Deep-fried spiced gram flour fritters loaded with mixed vegetables.' },
  { code: '4250', name: 'Onion Rings', category: 'Vegetable Dishes', price: 850, description: 'Crisp batter-fried fresh onion rings served with dipping sauce.' },
  { code: '4251', name: 'Batter Fried Vegetables', category: 'Vegetable Dishes', price: 950, description: 'Crispy golden tempura-style fried mixed garden vegetables.' },
  { code: '4256', name: 'French Fries', category: 'Vegetable Dishes', price: 1050, description: 'Classic golden-fried potato batons seasoned with salt.' },

  // EGG DISHES
  { code: '4252', name: 'Sri Lankan Omlette', category: 'Egg Dishes', price: 750, description: 'Fluffy pan-fried eggs folded with chopped green chillies, onions, and curry leaves.' },
  { code: '4253', name: 'Savory Omlette', category: 'Egg Dishes', price: 800, description: 'Classic egg omelette loaded with chopped fresh tomatoes and herbs.' },
  { code: '4254', name: 'Cheese Omlette', category: 'Egg Dishes', price: 950, description: 'A rich and tender folded egg omelette filled with melted cheese.' },
  { code: '4260', name: 'Chicken Omlette', category: 'Egg Dishes', price: 1000, description: 'Fluffy omelette folded with seasoned minced chicken and spring onions.' },

  // MEAT DISHES
  { code: '4234', name: 'Fried Chicken Sausages', category: 'Meat Dishes', price: 1150, description: 'Deep-fried chicken sausages served with a touch of mustard.' },
  { code: '4235', name: 'Devilled Chicken Sausages', category: 'Meat Dishes', price: 1250, description: 'Sausage slices tossed in a fiery capsicum and tomato devilled sauce.' },
  { code: '4255', name: 'Fried Pork Sausages', category: 'Meat Dishes', price: 1250, description: 'Savory pork sausages fried golden and served hot.' },
  { code: '4232', name: 'Devilled Pork Sausages', category: 'Meat Dishes', price: 1350, description: 'Pork sausages stir-fried with onions and green chillies in devilled glaze.' },
  { code: '4138', name: 'Crispy Chicken Wings', category: 'Meat Dishes', price: 1150, description: 'Deep-fried seasoned chicken wings tossed in a spicy barbecue glaze.' },
  { code: '4230', name: 'Fried Chicken', category: 'Meat Dishes', price: 1350, description: 'Golden-crisp marinated chicken portion seasoned with local spices.' },
  { code: '4257', name: 'Batter Fried Chicken', category: 'Meat Dishes', price: 1450, description: 'Crispy tempura batter coated chicken chunks served with sweet chilli dip.' },
  { code: '4130', name: 'Devilled Chicken', category: 'Meat Dishes', price: 1450, description: 'Fried chicken chunks wok-tossed with capsicums and green chillies in hot glaze.' },
  { code: '4131', name: 'Sweet & Sour Chicken', category: 'Meat Dishes', price: 1450, description: 'Crispy chicken chunks with pineapple and vegetables in sweet-sour sauce.' },
  { code: '4133', name: 'Chilli Chicken', category: 'Meat Dishes', price: 1450, description: 'Chinese-style hot chicken stir-fried with bell peppers, garlic, and soy.' },
  { code: '4134', name: 'Chicken Stew', category: 'Meat Dishes', price: 1450, description: 'Comforting, mild chicken gravy simmered with potatoes, carrots, and milk.' },
  { code: '4137', name: 'Fried Chicken Masala', category: 'Meat Dishes', price: 1550, description: 'Pan-fried chicken simmered in a thick, aromatic Indian-spiced masala gravy.' },
  { code: '4197', name: 'Chicken in Hot Garlic Sauce', category: 'Meat Dishes', price: 1450, description: 'Tender chicken slices stir-fried in a rich, savory garlic-chilli sauce.' },
  { code: '4199', name: 'Pepper Chicken', category: 'Meat Dishes', price: 1450, description: 'Fiery dry chicken dish heavily seasoned with freshly crushed black peppercorns.' },
  { code: '4200', name: 'Chicken Black Curry', category: 'Meat Dishes', price: 1550, description: 'Traditional Sri Lankan roasted black curry with tender chicken chunks.' },
  { code: '4194', name: 'Pork Stew (Boneless)', category: 'Meat Dishes', price: 1950, description: 'Mild and creamy pork stew cooked with vegetables and mild spices.' },
  { code: '4195', name: 'Pork Black Curry (Boneless)', category: 'Meat Dishes', price: 1950, description: 'Highly seasoned, aromatic pork curry prepared with roasted local spices.' },
  { code: '4205', name: 'Devilled Pork (Boneless)', category: 'Meat Dishes', price: 1950, description: 'Savory pork cubes tossed with onions, peppers, and green chillies in devilled glaze.' },
  { code: '4207', name: 'Chili Pork (Boneless)', category: 'Meat Dishes', price: 1950, description: 'Spicy dry pork wok-tossed with dark soy, garlic, and green chillies.' },
  { code: '4211', name: 'Pepper Pork (Boneless)', category: 'Meat Dishes', price: 1950, description: 'Dry boneless pork tossed with plenty of black pepper and curry leaves.' },
  { code: '4203', name: 'Pork Bacon', category: 'Meat Dishes', price: 1950, description: 'Crispy fried premium pork bacon slices served hot.' },
  { code: '4213', name: 'Pepper Style Mutton (Boneless)', category: 'Meat Dishes', price: 2650, description: 'Highly spiced boneless mutton stir-fried with black pepper and onions.' },
  { code: '4190', name: 'Mutton Black Curry (Boneless)', category: 'Meat Dishes', price: 2650, description: 'Rich, dark roasted mutton curry cooked in Sri Lankan style.' },
  { code: '4191', name: 'Mutton Stew (Boneless)', category: 'Meat Dishes', price: 2650, description: 'Creamy mutton stew slow-cooked with carrots, potatoes, and milk.' },

  // SEAFOOD DISHES
  { code: '4231', name: 'Fried Fish', category: 'Seafood Dishes', price: 1750, description: 'Crispy pan-fried seasoned fish slices served with lime wedges.' },
  { code: '4160', name: 'Devilled Fish', category: 'Seafood Dishes', price: 1850, description: 'Fried fish slices stir-fried with onions, tomatoes, and capsicum in spicy glaze.' },
  { code: '4161', name: 'Fish Nuggets', category: 'Seafood Dishes', price: 1850, description: 'Golden batter-coated fish bites served with tartar dipping sauce.' },
  { code: '4162', name: 'Fish Stew', category: 'Seafood Dishes', price: 1850, description: 'Mild fish curry simmered with white coconut milk and spices.' },
  { code: '4163', name: 'Fish Curry', category: 'Seafood Dishes', price: 1850, description: 'Spicy, tangy local fish curry cooked with tamarind and red chilli.' },
  { code: '4165', name: 'Sweet & Sour Fish', category: 'Seafood Dishes', price: 1850, description: 'Crisp fish fillets with pineapple and vegetables in sweet-sour sauce.' },
  { code: '4166', name: 'Spicy Pepper Fish', category: 'Seafood Dishes', price: 1850, description: 'Wok-tossed fish pieces seasoned with black pepper, spring onions, and garlic.' },
  { code: '4170', name: 'Devilled Prawns', category: 'Seafood Dishes', price: 1950, description: 'Succulent prawns tossed with fresh bell peppers and red chillies in devilled glaze.' },
  { code: '4171', name: 'Battered Prawns', category: 'Seafood Dishes', price: 1950, description: 'Crispy batter-fried prawns served with sweet chilli dip.' },
  { code: '4172', name: 'Sweet & Sour Prawns', category: 'Seafood Dishes', price: 1950, description: 'Succulent prawns with diced peppers and pineapple in sweet-sour glaze.' },
  { code: '4173', name: 'Chilli Prawns', category: 'Seafood Dishes', price: 1950, description: 'Wok-tossed prawns in hot soy-garlic sauce with fresh chillies.' },
  { code: '4174', name: 'Hot Garlic Prawns', category: 'Seafood Dishes', price: 1950, description: 'Succulent prawns cooked in a rich, buttery garlic sauce.' },
  { code: '4175', name: 'Prawns Curry Sri Lankan Style', category: 'Seafood Dishes', price: 1950, description: 'Creamy coconut milk prawn curry seasoned with fenugreek and moringa leaves.' },
  { code: '4178', name: 'Battered Cuttlefish', category: 'Seafood Dishes', price: 1950, description: 'Crispy batter-fried cuttlefish rings served hot.' },
  { code: '4180', name: 'Hot Butter Cuttlefish', category: 'Seafood Dishes', price: 1950, description: 'An island favorite! Crispy cuttlefish rings tossed in butter, chillies, and green onions.' },
  { code: '4181', name: 'Devilled Cuttlefish', category: 'Seafood Dishes', price: 1950, description: 'Griddle-fried cuttlefish rings in a fiery Capsicum and tomato glaze.' },
  { code: '4182', name: 'Cuttlefish Curry', category: 'Seafood Dishes', price: 1950, description: 'Spicy cuttlefish curry simmered in local roasted red spices.' }
];

export const mockMenuCategories = [
    { id: 1, name: 'All' },
    { id: 2, name: 'Soups' },
    { id: 3, name: 'Salads' },
    { id: 4, name: 'Fried Rice' },
    { id: 5, name: 'Noodles' },
    { id: 6, name: 'Chop Suey' },
    { id: 7, name: 'Kottu' },
    { id: 8, name: 'String Hopper Kottu' },
    { id: 9, name: 'Pasta & Spaghetti' },
    { id: 10, name: 'Vegetable Dishes' },
    { id: 11, name: 'Egg Dishes' },
    { id: 12, name: 'Meat Dishes' },
    { id: 13, name: 'Seafood Dishes' }
];

// Re-added mockMenus to prevent other admin pages from breaking compile checks
export const mockMenus = [
    {
        id: 1,
        name: 'Birthday Party Bundle',
        description: 'Perfect collection for celebrating special occasions',
        category: 'Birthday Party',
        price: 3500,
        image: '/images/hero_cake_pastries.png',
        productsCount: 4,
        status: 'Active'
    },
    {
        id: 2,
        name: 'Corporate Meeting Spread',
        description: 'Professional assortment suitable for business gatherings',
        category: 'Corporate Event',
        price: 5200,
        image: '/images/hero_bread_basket_1779987305856.png',
        productsCount: 5,
        status: 'Active'
    },
    {
        id: 3,
        name: 'Wedding Deluxe Package',
        description: 'Elegant selection for your special day',
        category: 'Wedding',
        price: 8500,
        image: '/images/chocolate_cake_1779987318818.png',
        productsCount: 6,
        status: 'Active'
    },
    {
        id: 4,
        name: 'Holiday Special',
        description: 'Festive treats and traditional favorites',
        category: 'Holiday',
        price: 4200,
        image: '/images/butterscotch_pastry_1779987365708.png',
        productsCount: 5,
        status: 'Active'
    },
    {
        id: 5,
        name: 'Breakfast Combo',
        description: 'Start your day with our morning favorites',
        category: 'Breakfast',
        price: 1800,
        image: '/images/veg_puff_1779987334434.png',
        productsCount: 3,
        status: 'Active'
    }
];

import { mockProducts as products } from './mockProducts';
export { products as mockProducts };
