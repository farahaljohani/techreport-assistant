class UnitConverter:
    # Common engineering unit conversions
    CONVERSIONS = {
        "length": {
            "m_to_ft": 3.28084,
            "ft_to_m": 0.3048,
            "m_to_mm": 1000,
            "mm_to_m": 0.001,
            "m_to_in": 39.3701,
            "in_to_m": 0.0254,
            "km_to_mi": 0.621371,
            "mi_to_km": 1.60934,
        },
        "velocity": {
            "ms_to_fts": 3.28084,
            "fts_to_ms": 0.3048,
            "kmh_to_ms": 0.27778,
            "ms_to_kmh": 3.6,
        },
        "pressure": {
            "pa_to_mpa": 0.000001,
            "mpa_to_pa": 1000000,
            "pa_to_psi": 0.000145038,
            "psi_to_pa": 6894.76,
            "atm_to_pa": 101325,
            "pa_to_atm": 0.00000986923,
        },
        "force": {
            "n_to_lbf": 0.224809,
            "lbf_to_n": 4.44822,
            "kn_to_n": 1000,
            "n_to_kn": 0.001,
        },
        "temperature": {
            "c_to_f": lambda x: (x * 9/5) + 32,
            "f_to_c": lambda x: (x - 32) * 5/9,
            "c_to_k": lambda x: x + 273.15,
            "k_to_c": lambda x: x - 273.15,
        }
    }

    @staticmethod
    def convert(value: float, from_unit: str, to_unit: str) -> float:
        """Convert between units."""
        key = f"{from_unit.lower()}_to_{to_unit.lower()}"
        
        for category, conversions in UnitConverter.CONVERSIONS.items():
            if key in conversions:
                conversion = conversions[key]
                if callable(conversion):
                    return conversion(value)
                return value * conversion
        
        return None

    @staticmethod
    def get_available_conversions() -> dict:
        """Get list of available conversions."""
        return UnitConverter.CONVERSIONS
