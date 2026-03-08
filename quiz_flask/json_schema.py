from typing import List, Dict, Any

def dict_manipulate(data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
  orgnized_list = []

  for data in data_list:
    isValid = True

    answers = data.get("answers")
    if not answers or not isinstance(answers, dict):
      continue

    if not data.get("question"):
      question = answers.pop("question", None)
      if question:
        data["question"] = question
      else:
        continue
    else:
      answers.pop("question", None)

    if not data.get("correct"):
      correct = answers.pop("correct", None)
      if correct:
        data["correct"] = correct
      else:
        data["correct"] = "0"
    else:
      answers.pop("correct", None)

    if len(data["answers"]) > 1:
      for key in data["answers"].keys():
        if not str(key).isdigit():
          isValid = False
          break
    else:
      isValid = False

    if data["correct"] not in data["answers"] and data["correct"] != "0":
      isValid = False

    if isValid:
      orgnized_list.append(data)

  return orgnized_list
