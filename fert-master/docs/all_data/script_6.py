
# REGIONS 13-20: Coastal, Southern, Brahmaputra & Islands (42 remaining files)
print("\nFINAL STRETCH: REMAINING 42 FILES")
print("="*100)

# REGION 13: Eastern Coastal Plains (6 files)
print("\nREGION 13: EASTERN COASTAL PLAINS (6 files)")
print("-" * 100)

region = "Eastern Coastal Plains"
base_params = {
    'temps_min': [24, 14, 20, 22, 22, 22, 23, 26, 16, 16, 22, 24, 14, 18],
    'temps_max': [36, 28, 34, 36, 36, 36, 34, 36, 32, 30, 34, 34, 28, 34],
    'rain_min': [100, 50, 50, 40, 30, 75, 50, 125, 150, 150, 50, 50, 40, 40],
    'rain_max': [200, 100, 120, 100, 100, 150, 100, 185, 300, 250, 100, 100, 75, 100],
    'moisture': ['90-100'] * 14,
    'humidity': ['75-85'] * 14,
    'pH': ['5.5-7.5'] * 14,
    'N': ['115-145', '115-145', '115-145', '78-98', '78-98', '240-290', '115-145', '58-78', '115-145', '95-118', '23-38', '33-38', '68-78', '23-38'],
    'P': ['48-58', '48-58', '58-78', '48-58', '43-50', '95-118', '48-58', '33-38', '48-58', '48-58', '48-58', '68-78', '33-38', '48-58'],
    'K': ['48-58', '33-38', '48-58', '43-50', '43-50', '115-148', '48-58', '33-38', '48-58', '48-58', '48-58', '23-38', '33-38', '23-38']
}

for soil in ["Coastal Alluvial Soil Deltaic", "Coastal Saline Soil", "Red and Laterite Soil", "Laterite Soil uplands", "Acid Sulphate Soil back waters", "Peaty and Marshy Soil"]:
    f = create_file(region, soil, base_params)
    files_created.append(f)
    print(f"✓ {len(files_created)}/98: {f}")

# REGION 14: Western Coastal Plains Konkan (5 files)
print("\nREGION 14: WESTERN COASTAL PLAINS KONKAN (5 files)")
print("-" * 100)

region = "Western Coastal Plains Konkan"
base_params['rain_min'] = [140, 70, 70, 60, 45, 95, 70, 155, 190, 190, 70, 70, 60, 60]
base_params['rain_max'] = [280, 140, 170, 140, 140, 210, 140, 260, 400, 330, 140, 140, 105, 140]

for soil in ["Coastal Alluvial Soil", "Laterite Soil", "Red Lateritic Soil", "Coastal Saline Soil mangroves", "Black Soil patches"]:
    f = create_file(region, soil, base_params)
    files_created.append(f)
    print(f"✓ {len(files_created)}/98: {f}")

# REGION 15: Western Ghats (5 files)
print("\nREGION 15: WESTERN GHATS (5 files)")
print("-" * 100)

region = "Western Ghats"
base_params['pH'] = ['5.0-6.5'] * 14
base_params['rain_min'] = [160, 80, 80, 70, 55, 110, 80, 175, 220, 220, 80, 80, 70, 70]
base_params['rain_max'] = [320, 160, 190, 160, 160, 240, 160, 300, 450, 380, 160, 160, 120, 160]

for soil in ["Laterite Soil", "Red Soil", "Forest Soil high rainfall", "Lateritic Red Soil", "Brown Forest Soil"]:
    f = create_file(region, soil, base_params)
    files_created.append(f)
    print(f"✓ {len(files_created)}/98: {f}")

# REGION 16: Southern Plateau (6 files)
print("\nREGION 16: SOUTHERN PLATEAU KARNATAKA_TAMIL NADU (6 files)")
print("-" * 100)

region = "Southern Plateau Karnataka_Tamil Nadu"
base_params['temps_min'] = [24, 14, 21, 23, 23, 23, 23, 26, 17, 17, 23, 24, 14, 19]
base_params['temps_max'] = [38, 29, 35, 38, 38, 38, 35, 37, 32, 30, 35, 35, 29, 35]
base_params['rain_min'] = [70, 38, 38, 32, 22, 58, 42, 98, 138, 138, 38, 38, 32, 32]
base_params['rain_max'] = [150, 72, 98, 88, 78, 128, 88, 158, 278, 228, 88, 88, 68, 88]
base_params['pH'] = ['5.5-7.0'] * 14

for soil in ["Red Soil", "Red and Yellow Soil", "Black Soil", "Laterite Soil", "Red Loamy Soil", "Saline_Alkaline Soil patches"]:
    f = create_file(region, soil, base_params)
    files_created.append(f)
    print(f"✓ {len(files_created)}/98: {f}")

# REGION 17: Southern Coastal Plains (6 files)
print("\nREGION 17: SOUTHERN COASTAL PLAINS (6 files)")
print("-" * 100)

region = "Southern Coastal Plains"
base_params['rain_min'] = [85, 42, 42, 35, 27, 63, 47, 105, 145, 145, 42, 42, 35, 35]
base_params['rain_max'] = [165, 82, 105, 92, 82, 135, 92, 165, 285, 235, 92, 92, 70, 92]
base_params['humidity'] = ['75-85'] * 14

for soil in ["Coastal Alluvial Soil", "Red Sandy Soil", "Black Soil river deltas", "Coastal Saline Soil", "Laterite Soil", "Acid Sulphate Soil"]:
    f = create_file(region, soil, base_params)
    files_created.append(f)
    print(f"✓ {len(files_created)}/98: {f}")

pct = int(len(files_created) / 98 * 100)
print(f"\nProgress: {len(files_created)}/98 ({pct}%)")
print("="*100)
