
# Fix syntax and continue
print("\nREGION 5: DECCAN PLATEAU (6 files)")
print("-" * 100)

region = "Deccan Plateau"
base_params = {
    'temps_min': [24, 13, 21, 23, 23, 23, 23, 26, 17, 17, 23, 24, 13, 19],
    'temps_max': [39, 29, 36, 39, 39, 39, 36, 38, 33, 31, 36, 36, 29, 36],
    'rain_min': [65, 35, 35, 30, 20, 55, 40, 95, 135, 135, 35, 35, 30, 30],
    'rain_max': [145, 70, 95, 85, 75, 125, 85, 155, 275, 225, 85, 85, 65, 85],
    'moisture': ['83-93'] * 14,
    'humidity': ['63-73'] * 14,
    'pH': ['7.5-9.0'] * 14,
    'N': ['98-135', '98-135', '98-135', '68-88', '68-88', '215-275', '98-135', '48-68', '98-135', '88-108', '20-33', '28-36', '58-73', '20-33'],
    'P': ['40-53', '40-53', '48-73', '40-53', '40-46', '83-113', '40-53', '28-36', '40-53', '40-53', '43-56', '63-76', '28-36', '43-56'],
    'K': ['40-53', '28-36', '40-53', '40-46', '40-46', '108-143', '40-53', '28-36', '40-53', '40-53', '43-56', '23-36', '28-36', '23-36']
}

soils = ["Black Soil Deep Regur", "Black Soil Shallow Regur", "Red Soil", "Red and Yellow Soil", "Mixed Red_Black Soil", "Laterite Soil patches"]
for soil in soils:
    f = create_file(region, soil, base_params)
    files_created.append(f)
    print(f"✓ {len(files_created)}/98: {f}")

print("\nREGION 6: EASTERN PLATEAU CHOTANAGPUR (5 files)")
print("-" * 100)

region = "Eastern Plateau Chotanagpur"
base_params['temps_min'] = [23, 12, 19, 21, 21, 21, 22, 25, 14, 14, 21, 23, 12, 16]
base_params['temps_max'] = [36, 26, 33, 34, 34, 36, 32, 36, 29, 27, 32, 32, 26, 32]
base_params['rain_min'] = [110, 55, 55, 45, 30, 85, 55, 130, 160, 160, 55, 55, 45, 45]
base_params['rain_max'] = [210, 110, 130, 110, 110, 160, 110, 190, 310, 260, 110, 110, 80, 110]
base_params['pH'] = ['5.5-6.8'] * 14
base_params['N'] = ['105-145', '105-145', '105-145', '72-92', '72-92', '215-290', '105-145', '55-75', '105-145', '88-115', '22-38', '32-38', '65-78', '22-38']

for soil in ["Red Soil", "Red and Yellow Soil", "Laterite Soil", "Alluvial Soil valleys", "Forest Soil"]:
    f = create_file(region, soil, base_params)
    files_created.append(f)
    print(f"✓ {len(files_created)}/98: {f}")

print("\nREGION 7: CENTRAL HIGHLANDS (4 files)")
print("-" * 100)

region = "Central Highlands"
base_params['temps_min'] = [23, 12, 20, 22, 22, 22, 22, 25, 16, 16, 22, 23, 12, 18]
base_params['temps_max'] = [38, 28, 35, 38, 38, 38, 35, 37, 32, 30, 35, 35, 28, 35]
base_params['pH'] = ['7.0-8.5'] * 14

for soil in ["Black Soil", "Red and Yellow Soil", "Mixed Black_Red Soil", "Alluvial Soil river valleys"]:
    f = create_file(region, soil, base_params)
    files_created.append(f)
    print(f"✓ {len(files_created)}/98: {f}")

print("\nREGION 8: WESTERN ARID REGION THAR DESERT (5 files)")
print("-" * 100)

region = "Western Arid Region Thar Desert"
base_params['temps_min'] = [24, 8, 18, 20, 18, 20, 20, 26, 12, 13, 20, 22, 8, 14]
base_params['temps_max'] = [42, 28, 38, 40, 40, 40, 38, 40, 35, 32, 38, 38, 28, 38]
base_params['rain_min'] = [25, 25, 25, 20, 15, 40, 25, 80, 100, 100, 25, 25, 20, 20]
base_params['rain_max'] = [100, 75, 90, 75, 75, 120, 75, 140, 250, 200, 75, 75, 60, 75]
base_params['humidity'] = ['35-60'] * 14
base_params['pH'] = ['7.5-9.0'] * 14
base_params['moisture'] = ['50-70'] * 14

for soil in ["Arid_Desert Soil Sandy", "Saline Soil", "Saline_Alkaline Soil", "Red Sandy Soil", "Sierozem Soil"]:
    f = create_file(region, soil, base_params)
    files_created.append(f)
    print(f"✓ {len(files_created)}/98: {f}")

pct = int(len(files_created) / 98 * 100)
print(f"\nProgress: {len(files_created)}/98 ({pct}%)")
print("="*100)
