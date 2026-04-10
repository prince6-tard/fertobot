
import pandas as pd
import json

# I'll create a systematic batch generation system for all 98 files
# Let me start by creating batches of files for each region

print("="*100)
print("GENERATING ALL 98 EXHAUSTIVE AGRICULTURAL DATA FILES")
print("This will take several iterations - Starting Batch Generation")
print("="*100)

# Load the complete mapping
with open('COMPLETE_SOIL_REGION_MAPPING.json', 'r') as f:
    soil_mapping = json.load(f)

# Base crop data structure
base_crops = ['Rice', 'Wheat', 'Maize', 'Jowar (Sorghum)', 'Bajra (Pearl Millet)', 
              'Sugarcane', 'Cotton', 'Jute', 'Tea', 'Coffee', 
              'Groundnut', 'Soybean', 'Mustard', 'Pulses (General)']

# Function to generate standardized data for any region-soil combination
def generate_regional_data(region, soil_type, climate_params, soil_params, nutrient_adj):
    """
    Generate complete 25-parameter data for 14 crops
    climate_params: (min_temp_adj, max_temp_adj, rainfall_adj)
    soil_params: (ph_range, moisture_range, humidity_range)
    nutrient_adj: (n_adj, p_adj, k_adj)
    """
    
    base_temps_min = [22, 10, 18, 20, 20, 20, 21, 24, 15, 15, 20, 22, 10, 15]
    base_temps_max = [35, 25, 32, 32, 32, 35, 30, 35, 30, 28, 30, 30, 25, 30]
    base_rain_min = [100, 50, 50, 40, 25, 75, 50, 120, 150, 150, 50, 50, 40, 40]
    base_rain_max = [200, 100, 120, 100, 100, 150, 100, 180, 300, 250, 100, 100, 75, 100]
    
    data = {
        'Crop': base_crops,
        'Region': [region] * 14,
        'Soil_Type': [soil_type] * 14,
        'Min_Temp_C': [t + climate_params[0] for t in base_temps_min],
        'Max_Temp_C': [t + climate_params[1] for t in base_temps_max],
        'Min_Rainfall_cm': [max(15, r + climate_params[2]) for r in base_rain_min],
        'Max_Rainfall_cm': [r + climate_params[2] for r in base_rain_max],
        'Total_Water_Requirement_Min_cm': [120, 45, 50, 40, 35, 200, 70, 100, 150, 150, 40, 45, 35, 35],
        'Total_Water_Requirement_Max_cm': [150, 65, 80, 60, 50, 250, 100, 120, 200, 200, 60, 65, 50, 50],
        'Soil_Moisture_Content_Percent': soil_params[1],
        'Humidity_Percent': soil_params[2],
        'Soil_pH': [soil_params[0]] * 14,
        'Nitrogen_Kg_ha': [
            f'{100+nutrient_adj[0]}-{150+nutrient_adj[0]}', f'{100+nutrient_adj[0]}-{150+nutrient_adj[0]}',
            f'{100+nutrient_adj[0]}-{150+nutrient_adj[0]}', f'{70+int(nutrient_adj[0]*0.7)}-{90+int(nutrient_adj[0]*0.7)}',
            f'{70+int(nutrient_adj[0]*0.7)}-{90+int(nutrient_adj[0]*0.7)}', f'{200+nutrient_adj[0]*2}-{300+nutrient_adj[0]*2}',
            f'{100+nutrient_adj[0]}-{150+nutrient_adj[0]}', f'{50+int(nutrient_adj[0]*0.5)}-{80+int(nutrient_adj[0]*0.5)}',
            f'{100+nutrient_adj[0]}-{150+nutrient_adj[0]}', f'{80+int(nutrient_adj[0]*0.8)}-{120+int(nutrient_adj[0]*0.8)}',
            f'{20+int(nutrient_adj[0]*0.2)}-{40+int(nutrient_adj[0]*0.2)}', f'{30+int(nutrient_adj[0]*0.3)}-{40+int(nutrient_adj[0]*0.3)}',
            f'{60+int(nutrient_adj[0]*0.6)}-{80+int(nutrient_adj[0]*0.6)}', f'{20+int(nutrient_adj[0]*0.2)}-{40+int(nutrient_adj[0]*0.2)}'
        ],
        'Phosphorus_Kg_ha': [f'{40+nutrient_adj[1]}-{60+nutrient_adj[1]}'] * 14,
        'Potassium_Kg_ha': [f'{40+nutrient_adj[2]}-{60+nutrient_adj[2]}'] * 14,
        'Ca_Kg_ha': ['25-30', '20-25', '12-14', '10-20', '10-20', '25-35', '20-30', '15-20', '20-30', '20-30', '30-40', '20-25', '15-20', '10-20'],
        'Mg_Kg_ha': ['15-20', '10-16', '10-12', '10-12', '10-12', '20-25', '18-20', '10-12', '18-20', '18-20', '18-25', '10-15', '10-12', '8-10'],
        'S_Kg_ha': ['25-40', '25-30', '30-35', '20-25', '15-20', '50-60', '35-50', '25-30', '35-50', '35-50', '25-40', '20-30', '35-40', '15-20'],
        'Zn_g_ha': ['500-600'] * 14,
        'Fe_g_ha': ['5000-6000'] * 14,
        'B_g_ha': ['500-600', '400-500', '400-500', '300-400', '300-400', '600-800', '500-600', '300-400', '800-1000', '800-1000', '400-500', '400-500', '300-400', '200-300'],
        'Mo_g_ha': ['60-80', '50-80', '50-80', '40-60', '40-60', '80-100', '60-80', '40-60', '100-120', '100-120', '50-80', '60-80', '40-60', '30-40'],
        'Cu_g_ha': ['500-600'] * 14,
        'Mn_g_ha': ['2500-3000'] * 14,
        'Cl_g_ha': ['700-900'] * 14
    }
    
    return pd.DataFrame(data)

# Counter
files_created = 0
batch_size = 15  # Create 15 files at a time

# BATCH 1: Complete Indo-Gangetic Plains (6 soils)
print("\n" + "="*100)
print("BATCH 1: INDO-GANGETIC PLAINS (6 SOIL TYPES)")
print("="*100)

region_name = "Indo-Gangetic Plains"
soils_data = [
    ("Alluvial Soil (Khadar - New)", (0, 0, 0), ('6.5-7.5', ['90-100']*14, ['70-80']*14), (20, 10, 10)),
    ("Alluvial Soil (Bangar - Old)", (0, 0, -2), ('7.0-8.0', ['85-95']*14, ['68-78']*14), (10, 5, 15)),
    ("Saline-Alkaline Soil (Sodic)", (0, 0, 0), ('8.5-10.0', ['90-100']*14, ['70-80']*14), (-10, -5, -5)),
    ("Saline Soil (Coastal influenced)", (1, 1, 0), ('7.5-9.0', ['85-95']*14, ['75-85']*14), (-5, -3, -3)),
    ("Calcareous Soil", (0, 0, -3), ('7.5-8.5', ['88-98']*14, ['68-78']*14), (15, 8, 8)),
    ("Sandy Loam Alluvial", (0, 0, -5), ('6.8-7.8', ['80-90']*14, ['65-75']*14), (15, 10, 5))
]

for soil, climate, soil_p, nutrient in soils_data:
    df = generate_regional_data(region_name, soil, climate, soil_p, nutrient)
    filename = f"Region_IndoGangetic_{soil.replace(' ', '').replace('(', '').replace(')', '').replace('-', '')}.csv"
    df.to_csv(filename, index=False)
    files_created += 1
    print(f"✓ File {files_created}/98: {filename}")

print(f"\nBatch 1 Complete: 6 files created")
print(f"Total Progress: {files_created}/98 ({files_created/98*100:.1f}%)")
