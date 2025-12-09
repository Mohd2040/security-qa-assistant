import pandas as pd
from deep_translator import GoogleTranslator

INPUT_FILE = "ecc1_arabic_transaltion.xlsx"
OUTPUT_FILE = "ecc1_arabic_transaltion_with_arabic.xlsx"

# تحميل الملف
df = pd.read_excel(INPUT_FILE, sheet_name="Sheet1")

# أسماء الأعمدة (زي اللي في ملفك)
en_col = "Question_Text"
ar_col = "الترجمة بالعربي Question_Text"

# لو عمود الترجمة مش موجود لأي سبب، ننشئه
if ar_col not in df.columns:
    df[ar_col] = ""

translator = GoogleTranslator(source="en", target="ar")

def translate_to_arabic(text):
    if pd.isna(text):
        return text
    text = str(text).strip()
    if text == "":
        return text

    # هنا الترجمة الفعلية
    translated = translator.translate(text)
    return translated

# نمرّ على كل الصفوف ونترجم فقط اللي ما له ترجمة عربية
for idx, row in df.iterrows():
    en_text = row[en_col]
    ar_text = row[ar_col]

    # نترجم بس لو في نص إنجليزي وما فيش ترجمة عربية، أو الترجمة نفس الإنجليزي (من المحاولة السابقة)
    if (
        pd.notna(en_text)
        and str(en_text).strip() != ""
        and (pd.isna(ar_text) or str(ar_text).strip() == "" or str(ar_text).strip() == str(en_text).strip())
    ):
        print(f"Translating row {idx} ...")
        try:
            df.at[idx, ar_col] = translate_to_arabic(en_text)
        except Exception as e:
            print(f"❌ Error in row {idx}: {e}")
            # نخليها زي ما هي لو حصل خطأ، عشان تعرف وين المشكلة
            df.at[idx, ar_col] = ar_text

# حفظ الملف في ملف جديد
df.to_excel(OUTPUT_FILE, sheet_name="Sheet1", index=False)
print("✅ Done! Saved as:", OUTPUT_FILE)
