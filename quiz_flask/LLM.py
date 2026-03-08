import multiprocessing
import json_repair
from llama_cpp import Llama
import gc
import os
import json_schema
import json

def parse_json(text):
  try:
    return json_repair.loads(text)
  except:
    return None

def dynamic_tokens(llm, msgs, sm=128):
  im_start = llm.tokenize(b"<|im_start|>")
  im_end = llm.tokenize(b"<|im_end|>")
  newline = llm.tokenize(b"\n")
  total_tokens = 0
  for msg in msgs:
    total_tokens += len(im_start)
    total_tokens += len(llm.tokenize(msg['role'].encode('utf-8')))
    total_tokens += len(newline)
    total_tokens += len(llm.tokenize(msg['content'].encode('utf-8')))
    total_tokens += len(im_end)
    total_tokens += len(newline)

  total_tokens += len(im_start)
  total_tokens += len(llm.tokenize(b"assistant"))
  total_tokens += len(newline)

  try:
    context_size = llm.n_ctx()  # Try as method first
  except TypeError:
    context_size = llm.n_ctx  # Fall back to property

  available_tokens = context_size - total_tokens - sm

  max_tokens = min(available_tokens, 512)

  max_tokens = max(max_tokens, 64)

  return max_tokens

def load_model():
  format = "qwen"
  try:
    with open("settings.json", "r", encoding="utf-8") as gpu:
      data = json.load(gpu)

    if data:
      gpu = data["GPU"]
      model = "Qwen2.5-1.5B-Instruct.F16.gguf" if data["type"] == "f16" else "Qwen2.5-1.5B-Instruct.Q4_K_M.gguf"
  except:
    model = "Qwen2.5-1.5B-Instruct.Q4_K_M.gguf"

  UPLOAD_FOLDER = os.path.abspath("../LLM")
  path = os.path.join(UPLOAD_FOLDER, model)

  if gpu == "0":
    cores = multiprocessing.cpu_count()
    if cores >= 4:
      cores = int(cores / 2)
    return Llama(
      model_path=path,
      n_ctx=2048,
      n_threads=cores,
      chat_format=format
    )
  elif gpu == "1":
    return Llama(
      model_path=path,
      n_ctx=2048,
      n_gpu_layers=-1,
      chat_format=format
    )

def generate_resp(MCQList, SYS_PROMPT):
  MCQ = []
  llm = None
  try:
    llm = load_model()

    for msg in MCQList:
      try:
        messages = [
          {"role": "system", "content": SYS_PROMPT},
          {"role": "user", "content": msg}
        ]

        max_tokens = dynamic_tokens(llm, messages)

        response = llm.create_chat_completion(
          messages=messages,
          temperature=0.1,
          top_p=0.9,
          max_tokens=max_tokens
        )

        response = response['choices'][0]['message']['content']
        response = parse_json(response)

        if response and response != "SKIP":
          if isinstance(response, list):
              MCQ.extend(response)
          else:
              MCQ.append(response)

      except Exception as e:
        print(f"Error processing question: {e}")
        continue

    return json_schema.dict_manipulate(MCQ)
  except Exception as e:
    print(f"Error in LLM call: {e}")
    return []
  finally:
    if llm is not None:
      del llm
      gc.collect()
