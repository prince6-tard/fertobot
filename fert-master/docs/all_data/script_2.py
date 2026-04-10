
# Continue generating - REGIONS 2, 3, 4 (Upper, Middle, Lower Gangetic Plains)
print("\nREGION 2: UPPER GANGETIC PLAINS (3 files)")
print("-" * 100)

region = "Upper Gangetic Plains"

# Base parameters for Upper Gangetic
base_params = {
    'temps_min': [22, 10, 18, 20, 20, 20, 21, 24, 15, 15, 20, 22, 10, 15],
    'temps_max': [36, 26, 33, 33, 33, 36, 31, 36, 31, 29, 31, 31, 26, 31],
    'rain_min': [95, 48, 48, 38, 23, 73, 48, 118, 148, 148, 48, 48, 38, 38],
    'rain_max': [195, 98, 118, 98, 98, 148, 98, 178, 298, 248, 98, 98, 73, 98],
    'moisture': ['88-98', '58-78', '58-78', '58-73', '58-73', '78-98', '58-78', '68-83', '78-88', '68-83', '58-73', '58-78', '58-73', '58-73'],
    'humidity': ['68-78', '48-68', '58-73', '58-68', '58-68', '68-83', '58-68', '78-88', '68-78', '68-78', '58-68', '58-68', '48-58', '58-68'],
    'pH': ['6.5-7.5'] * 14,
    'N': ['115-145', '115-145', '115-145', '78-98', '78-98', '240-290', '115-145', '58-78', '115-145', '95-118', '23-38', '33-38', '68-78', '23-38'],
    'P': ['48-58', '48-58', '58-78', '48-58', '43-50', '95-118', '48-58', '33-38', '48-58', '48-58', '48-58', '68-78', '33-38', '48-58'],
    'K': ['48-58', '33-38', '48-58', '43-50', '43-50', '115-148', '48-58', '33-38', '48-58', '48-58', '48-58', '23-38', '33-38', '23-38']
}

f = create_file(region, "Alluvial Soil", base_params)
files_created.append(f)
print(f"✓ {len(files_created)}/98: {f}")

# Sandy Soil
base_params['pH'] = ['6.8-7.8'] * 14
base_params['moisture'] = ['75-85'] * 14
base_params['N'] = ['105-135', '105-135', '105-135', '70-90', '70-90', '220-280', '105-135', '52-72', '105-135', '88-112', '20-35', '30-35', '62-75', '20-35']
f = create_file(region, "Sandy Soil", base_params)
files_created.append(f)
print(f"✓ {len(files_created)}/98: {f}")

# Calcareous Alluvial
base_params['pH'] = ['7.5-8.5'] * 14
base_params['N'] = ['108-138', '108-138', '108-138', '73-93', '73-93', '228-283', '108-138', '54-74', '108-138', '88-113', '22-36', '32-36', '64-76', '22-36']
f = create_file(region, "Calcareous Alluvial", base_params)
files_created.append(f)
print(f"✓ {len(files_created)}/98: {f}")

print("\nREGION 3: MIDDLE GANGETIC PLAINS (3 files)")
print("-" * 100)

region = "Middle Gangetic Plains"

base_params['temps_min'] = [23, 11, 19, 21, 21, 21, 22, 25, 16, 16, 21, 23, 11, 16]
base_params['temps_max'] = [36, 26, 33, 33, 33, 36, 31, 36, 31, 29, 31, 31, 26, 31]
base_params['pH'] = ['6.5-7.5'] * 14
base_params['N'] = ['118-148', '118-148', '118-148', '80-100', '80-100', '245-295', '118-148', '60-80', '118-148', '98-122', '24-39', '34-39', '70-82', '24-39']

f = create_file(region, "Alluvial Soil", base_params)
files_created.append(f)
print(f"✓ {len(files_created)}/98: {f}")

base_params['pH'] = ['7.5-8.5'] * 14
f = create_file(region, "Calcareous Soil", base_params)
files_created.append(f)
print(f"✓ {len(files_created)}/98: {f}")

base_params['pH'] = ['8.5-10.0'] * 14
base_params['N'] = ['98-133', '98-133', '98-133', '67-87', '67-87', '185-265', '98-133', '52-72', '98-133', '82-112', '20-36', '29-36', '58-76', '20-36']
f = create_file(region, "Saline_Alkaline Soil", base_params)
files_created.append(f)
print(f"✓ {len(files_created)}/98: {f}")

print("\nREGION 4: LOWER GANGETIC PLAINS (4 files)")
print("-" * 100)

region = "Lower Gangetic Plains"

base_params['temps_min'] = [24, 12, 20, 22, 22, 22, 23, 26, 17, 17, 22, 24, 12, 17]
base_params['temps_max'] = [35, 27, 32, 32, 32, 35, 30, 35, 30, 28, 30, 30, 27, 30]
base_params['rain_min'] = [105, 55, 55, 45, 30, 80, 55, 125, 155, 155, 55, 55, 45, 45]
base_params['rain_max'] = [220, 110, 130, 110, 110, 160, 110, 190, 320, 270, 110, 110, 85, 110]
base_params['humidity'] = ['75-85'] * 14
base_params['pH'] = ['6.0-7.5'] * 14
base_params['N'] = ['122-152', '122-152', '122-152', '82-102', '82-102', '250-300', '122-152', '62-82', '122-152', '100-125', '25-40', '35-40', '72-82', '25-40']

f = create_file(region, "Alluvial Soil", base_params)
files_created.append(f)
print(f"✓ {len(files_created)}/98: {f}")

base_params['pH'] = ['5.5-6.8'] * 14
base_params['N'] = ['105-140', '105-140', '105-140', '72-92', '72-92', '215-280', '105-140', '55-75', '105-140', '88-115', '22-37', '32-37', '65-77', '22-37']
f = create_file(region, "Red and Laterite Soil patches", base_params)
files_created.append(f)
print(f"✓ {len(files_created)}/98: {f}")

base_params['pH'] = ['7.5-9.0'] * 14
base_params['N'] = ['92-127', '92-127', '92-127', '63-83', '63-83', '175-255', '92-127', '50-70', '92-127', '78-108', '19-34', '28-34', '56-74', '19-34']
f = create_file(region, "Coastal Saline Soil", base_params)
files_created.append(f)
print(f"✓ {len(files_created)}/98: {f}")

base_params['pH'] = ['5.0-6.5'] * 14
base_params['moisture'] = ['95-100'] * 14
base_params['N'] = ['85-120', '85-120', '85-120', '58-78', '58-78', '160-240', '85-120', '45-65', '85-120', '72-102', '17-32', '25-32', '52-72', '17-32']
f = create_file(region, "Peaty and Marshy Soil", base_params)
files_created.append(f)
print(f"✓ {len(files_created)}/98: {f}")

print(f"\nProgress: {len(files_created)}/98 ({len(files_created)/98*100:.1f}%)")
print("="*100)
