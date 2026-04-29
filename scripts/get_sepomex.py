import pandas as pd
import json

def download_and_convert():
    # URL oficial del catálogo de SEPOMEX (formato Excel)
    url = "https://www.correosdemexico.gob.mx/datosabiertos/cp/cpdescarga.txt"
    
    print("⏳ Descargando catálogo oficial de SEPOMEX (esto puede tardar un minuto)...")
    
    # Leemos el archivo TXT oficial (separado por pipes '|')
    # Usamos latin-1 porque Correos de México usa codificación antigua
    try:
        df = pd.read_csv(url, sep='|', encoding='latin-1', skiprows=1, dtype={'d_codigo': str})
        
        # Renombramos columnas para que coincidan con tu script de TS
        # d_codigo -> cp
        # d_asenta -> asentamiento
        # D_mnpio -> municipio
        # d_estado -> estado
        
        data = []
        for _, row in df.iterrows():
            data.append({
                "cp": str(row['d_codigo']).zfill(5),
                "asentamiento": str(row['d_asenta']).upper(),
                "municipio": str(row['D_mnpio']).upper(),
                "estado": str(row['d_estado']).upper()
            })
            
        print(f"✅ Se procesaron {len(data)} registros.")
        
        with open('sepomex.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print("🎉 Archivo 'sepomex.json' generado con éxito.")
        
    except Exception as e:
        print(f"❌ Error al procesar: {e}")

if __name__ == "__main__":
    download_and_convert()