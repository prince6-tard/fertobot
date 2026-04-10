
# Continue with remaining regions 9-20 (62 more files to go)
print("\nCONTINUING WITH REMAINING 62 FILES...")
print("="*100)

# REGION 9: Semi-Arid Region (5 files)
print("\nREGION 9: SEMI-ARID REGION GUJARAT-RAJASTHAN (5 files)")
print("-" * 100)

region = "Semi_Arid Region Gujarat_Rajasthan"
base_params = {
    'temps_min': [23, 9, 19, 21, 19, 21, 21, 26, 13, 14, 21, 23, 9, 15],
    'temps_max': [40, 27, 37, 39, 39, 39, 37, 39, 34, 31, 37, 37, 27, 37],
    'rain_min': [30, 28, 28, 22, 17, 43, 28, 85, 105, 105, 28, 28, 22, 22],
    'rain_max': [110, 78, 93, 78, 78, 123, 78, 143, 255, 205, 78, 78, 63, 78],
    'moisture': ['55-75'] * 14,
    'humidity': ['40-65'] * 14,
    'pH': ['7.2-8.5'] * 14,
    'N': ['92-128', '92-128', '92-128', '63-83', '63-83', '175-255', '92-128', '47-67', '92-128', '77-107', '19-33', '27-33', '53-70', '19-33'],
    'P': ['38-50', '38-50', '46-70', '38-50', '36-44', '75-110', '38-50', '26-34', '38-50', '38-50', '38-50', '58-73', '26-34', '38-50'],
    'K': ['38-50', '26-34', '38-50', '38-44', '38-44', '95-138', '38-50', '26-34', '38-50', '38-50', '38-50', '20-34', '26-34', '20-34']
}

for soil in ["Arid Soil", "Black Soil medium", "Saline_Alkaline Soil", "Alluvial Soil Sabarmati Mahi valleys", "Mixed Red_Black Soil"]:
    f = create_file(region, soil, base_params)
    files_created.append(f)
    print(f"✓ {len(files_created)}/98: {f}")

# REGION 10-12: Himalayan and Northeastern (15 files total)
print("\nREGIONS 10-12: HIMALAYAN & NORTHEASTERN (15 files)")
print("-" * 100)

# Western Himalayan (5 files)
region = "Western Himalayan Region"
base_params['temps_min'] = [18, 5, 15, 16, 16, 15, 17, 20, 10, 10, 16, 18, 5, 12]
base_params['temps_max'] = [32, 22, 28, 28, 28, 30, 26, 32, 28, 25, 26, 26, 22, 28]
base_params['rain_min'] = [120, 60, 60, 50, 35, 90, 60, 140, 180, 180, 60, 60, 50, 50]
base_params['rain_max'] = [250, 120, 150, 130, 130, 180, 130, 220, 350, 290, 130, 130, 90, 130]
base_params['pH'] = ['5.0-6.8'] * 14
base_params['humidity'] = ['75-85'] * 14

for soil in ["Forest and Mountain Soil Podzolic", "Brown Forest Soil", "Alluvial Valley Soil Doon Terai", "Skeletal Soil high altitude", "Brown Hill Soil"]:
    f = create_file(region, soil, base_params)
    files_created.append(f)
    print(f"✓ {len(files_created)}/98: {f}")

# Eastern Himalayan (5 files)
region = "Eastern Himalayan Region"
for soil in ["Red and Laterite Soil", "Forest and Mountain Soil", "Alluvial Soil Brahmaputra valley", "Peaty Soil high rainfall areas", "Brown Forest Soil"]:
    f = create_file(region, soil, base_params)
    files_created.append(f)
    print(f"✓ {len(files_created)}/98: {f}")

# Northeastern Hills (5 files)
region = "Northeastern Hills"
base_params['pH'] = ['4.5-6.5'] * 14
for soil in ["Red and Laterite Soil", "Forest Soil", "Alluvial Soil valley pockets", "Acidic Hill Soil", "Peaty and Organic Soil"]:
    f = create_file(region, soil, base_params)
    files_created.append(f)
    print(f"✓ {len(files_created)}/98: {f}")

pct = int(len(files_created) / 98 * 100)
print(f"\nProgress: {len(files_created)}/98 ({pct}%)")
print("="*100)
