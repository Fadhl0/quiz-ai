from docx import Document

def parse(save_path): 
  text = []
  docx = Document(save_path)
  for para in docx.paragraphs:
    para_text = []
    curr_format = None
    curr_text = []

    left_raw = para.paragraph_format.left_indent
    first_raw = para.paragraph_format.first_line_indent
    left_emu = int(left_raw) if left_raw is not None else 0
    first_emu = int(first_raw) if first_raw is not None else 0
    total_inches = (left_emu + first_emu) / 914400
    if total_inches > 0:
      tab_count = round(total_inches / 0.5)
      para_text.append("\t" * tab_count)

    for run in para.runs:

      run_text = run.text
      if not run_text and '<w:tab/>' in run._element.xml:
        run_text = "\t"
      
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
            para_text.append(f" [highlight] {combined} [/highlight] ")
          elif curr_format == "bold":
            para_text.append(f"**{combined}**")
          elif curr_format == "color":
            para_text.append(f" [colored] {combined} [/colored] ")
          elif curr_format == "underline":
            para_text.append(f" [underline] {combined} [/underline] ")
          else:
            para_text.append(combined)
          curr_text = []
        curr_format = format_type
      
      curr_text.append(run_text)

    #remaining text
    if curr_text:
      combined = "".join(curr_text)
      if curr_format == "highlight":
        para_text.append(f" [highlight] {combined} [/highlight] ")
      elif curr_format == "bold":
        para_text.append(f"**{combined}**")
      elif curr_format == "color":
        para_text.append(f" [colored] {combined} [/colored] ")
      elif curr_format == "underline":
        para_text.append(f" [underline] {combined} [/underline] ")
      else:
        para_text.append(combined)

    text.append("".join(para_text))
  return "\n".join(text)