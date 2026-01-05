import json_repair
from llama_cpp import Llama
import gc
import os


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


def generate_resp(MCQList, SYS_PROMPT):
  model = "quiz_parser_q4.gguf"
  UPLOAD_FOLDER = os.path.abspath("../LLM")
  path = os.path.join(UPLOAD_FOLDER, model)
  MCQ = []
  llm = None
  try:
    llm = Llama(
      model_path=path,
      n_ctx=4096,
      n_threads=4,
      chat_format="qwen"
    )

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

    return MCQ
  except Exception as e:
    print(f"Error in LLM call: {e}")
    return []
  finally:
    if llm is not None:
      del llm
      gc.collect()
