from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from docx import Document
from werkzeug.utils import secure_filename
import re
import LLM
import json
import webbrowser
from threading import Timer


app = Flask(__name__, static_folder='../quiz_vite/dist', static_url_path='')
cors = CORS(app)

UPLOAD_FOLDER = os.path.abspath("uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def trim_all(text):
  try:
    text = re.sub(r" {2,}", " ", text)
    text = re.sub(r"[ ]+\n|\n[ ]+", "\n", text)
    text = re.sub(r"\n{3,}|[ ]*\n[ ]+\n", "\n\n", text)
    text = re.sub(r"‘|’", "'", text)          # ‘ ’
    text = re.sub(r"“|”", "\"", text)         # “ ”
    text = re.sub(r"[–—]", "-", text)         # – —
    text = re.sub(r"[_-]{6,}", "_____", text) # _ -
    text = re.sub(r"[‥…]", "..", text)        # ‥ …
    text = re.sub(r",{6,}", ".....", text)    # ,
    text = re.sub(r"\.{6,}", ".....", text)   # .
    return text.split("\n\n")
  except:
    return None

SYS_PROMPT = "\n".join([
  "You are a quiz parser. Output JSON for questions, \"SKIP\" for non-questions.",
  "",
  "**OUTPUT FORMAT:**",
  "1. NO valid multiple-choice questions → \"SKIP\"",
  "2. ONE valid question → JSON object",
  "3. MULTIPLE valid questions → JSON array in order of appearance",
  "",
  "**Question identification:**",
  "- Detect ALL questions in input: look for question marks, numbered items (1., 2., Q1, etc.), clear separators",
  "- Each distinct question gets separate JSON object in output",
  "",
  "**For EACH multiple-choice question:**",
  "- Extract question text and options",
  "- Format: {\"question\": \"text\", \"answers\": {\"1\": \"opt1\", \"2\": \"opt2\", ...}, \"correct\": \"value\"}",
  "- Renumber options sequentially from \"1\"",
  "",
  "**CORRECTNESS RULES (apply per question):**",
  "1. Set \"correct\" to a SINGLE digit (\"1\", \"2\", \"3\", etc.) ONLY when:",
  "   • Exactly ONE option is explicitly marked correct (bold, 'correct', highlight)",
  "   • Marking is UNAMBIGUOUS (e.g., 'Answer: C' not 'C and D')",
  "",
  "2. ALWAYS set \"correct\": \"0\" for ANY ambiguity including:",
  "   • Multiple options marked (e.g., 'B and C are correct')",
  "   • Phrases like 'both', 'all of', 'multiple'",
  "   • Any uncertainty about correct answer",
  "   • No clear marking",
  "   • 'None of the above' or 'All of the above' as option",
  "",
  "**TEXT FORMATTING HANDLING:**",
  "- Remove ALL formatting tags but keep the text inside them:",
  "• `[highlight]...[/highlight]` → keep only content inside",
  "• `**...**` → keep only content inside (bold)",
  "• `[colored]...[/colored]` → keep only content inside",
  "• `[underline]...[/underline]` → keep only content inside",
  "- If text has no formatting, leave as is",
  "",
  "**SKIP CONDITIONS (per question):**",
  "• NOT a question (statement, explanation, instruction)",
  "• NO multiple-choice options (e.g., open-ended, essay)",
  "• Question is incomplete/corrupted",
  "",
  "**CRITICAL:**",
  "- A question with \"correct\": \"0\" is STILL VALID and included",
  "- Only skip a question if it's NOT multiple-choice or NOT a question at all",
  "- Multiple correct answers → \"correct\": \"0\" (NOT SKIP)",
  "",
  "**EXAMPLES:**",
  "Input: '1. What is 2+2? A. 3 B. **4** C. 5\\n2. What is capital? (B and C correct) A. Paris B. London C. Berlin'",
  "Output: [",
  "  {\"question\": \"What is 2+2?\", \"answers\": {\"1\": \"3\", \"2\": \"4\", \"3\": \"5\"}, \"correct\": \"2\"},",
  "  {\"question\": \"What is capital?\", \"answers\": {\"1\": \"Paris\", \"2\": \"London\", \"3\": \"Berlin\"}, \"correct\": \"0\"}",
  "]",  "",
  "Input: 'What is 2+2? A. 3 B. 4\\n\\nReview: The sky is blue.'",
  "Output: {\"question\": \"What is 2+2?\", \"answers\": {\"1\": \"3\", \"2\": \"4\"}, \"correct\": \"0\"}",
  "",
  "Input: 'The capital of France is Paris. Water boils at 100°C.'",
  "Output: \"SKIP\"",
  "",
  "Input: '5-types of body waves ..(c)\\na-L-waves\\nb-R-waves\\nc-non of them'",
  "Output: {\"question\": \"types of body waves ..\", \"answers\": {\"1\": \"L-waves\", \"2\": \"R-waves\", \"3\": \"non of them\"}, \"correct\": \"3\"}",
  "",
  "Input: '..(b).. Is the movement of land during an earthquake\\n(a) gravity\\n(b) seismic\\n(c) magnetic'",
  "Output: {\"question\": \".... Is the movement of land during an earthquake\", \"answers\": {\"1\": \"gravity\", \"2\": \"seismic\", \"3\": \"magnetic\"}, \"correct\": \"2\"}",
  "",
  "**SUMMARY:**",
  "1. Find ALL questions in input",
  "2. For EACH: if multiple-choice → create JSON (even with correct: \"0\")",
  "3. If non-MCQ → exclude that question",
  "4. Output: 0 valid → \"SKIP\", 1 valid → object, 2+ valid → array",
  ""
])

@app.route('/')
def serve():
  return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
  file_path = os.path.join(app.static_folder, path)
  if os.path.exists(file_path):
    return send_from_directory(app.static_folder, path)
  else:
    return send_from_directory(app.static_folder, 'index.html')

@app.route("/upload", methods=["POST"])
def upload():
  text = []
  all_text = ""
  if "file" not in request.files:
    return jsonify(success=False, error="no file part"), 400

  file = request.files["file"]
  if file.filename == "":
    return jsonify(success=False, error="no selected file"), 400

  filename = secure_filename(file.filename)
  save_path = os.path.join(UPLOAD_FOLDER, filename)
  file.save(save_path)

  if filename.lower().endswith(".txt"):
    with open(save_path, "r", encoding="utf-8") as f:
      all_text = f.read().strip()


  elif filename.lower().endswith(".docx"):
    docx = Document(save_path)
    for para in docx.paragraphs:
      para_text = []
      curr_format = None
      curr_text = []

      for run in para.runs:
        if run.font.highlight_color is not None:
          format_type = "highlight"
        elif run.font.bold:
          format_type = "bold"
        elif run.font.color and run.font.color.rgb:
          format_type = "color"
        elif run.font.underline:
          format_type = "underline"
        else:
          format_type = "normal"

        if curr_format != format_type:
          if curr_text:
            combined = "".join(curr_text)
            if curr_format == "highlight":
              para_text.append(f"[highlight]{combined}[/highlight]")
            elif curr_format == "bold":
              para_text.append(f"**{combined}**")
            elif curr_format == "color":
              para_text.append(f"[colored]{combined}[/colored]")
            elif curr_format == "underline":
              para_text.append(f"[underline]{combined}[/underline]")
            else:
              para_text.append(combined)
            curr_text = []
          curr_format = format_type
        
        curr_text.append(run.text)

      #remaining text
      if curr_text:
        combined = "".join(curr_text)
        if curr_format == "highlight":
          para_text.append(f"[highlight]{combined}[/highlight]")
        elif curr_format == "bold":
          para_text.append(f"**{combined}**")
        elif curr_format == "color":
          para_text.append(f"[colored]{combined}[/colored]")
        elif curr_format == "underline":
          para_text.append(f"[underline]{combined}[/underline]")
        else:
          para_text.append(combined)

      text.append("".join(para_text))
    all_text = "\n".join(text)

  try:
    os.remove(save_path)
  except OSError as e:
    print("Failed to delete uploaded file:", e)

  all_text = trim_all(all_text)
  if all_text != None:
    all_text = [mcq for mcq in all_text if mcq]

  if file and len(all_text) != 0:
    result = LLM.generate_resp(all_text, SYS_PROMPT)
    if result:
      json_output = json.dumps(result, indent=2, ensure_ascii=False)
    else:
      print("No valid questions parsed")

  print(json_output)
  return jsonify(success=True, content=json.loads(json_output))

def open_browser():
  webbrowser.open("http://127.0.0.1:8412")

if __name__ == "__main__":
  Timer(1, open_browser).start()
  app.run(debug=True, use_reloader=False, port=8412)

