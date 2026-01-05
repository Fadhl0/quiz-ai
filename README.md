# 📚 Quiz AI-Powered Web application
A lightweight web application that lets you upload document containing Multiple-Choice Questions (MCQs) to test yourself. The app uses a local LLM (Large Language Model) to parse your document and power the interactive quiz.

## Snapshot
https://github.com/user-attachments/assets/11d11867-435a-40c1-9871-1bf3f97a6cbd

**Features:**
*   Upload `.docx` or `.txt` files with MCQs.
*   Local AI processing (runs privately on your CPU).
*   Simple web interface built with Flask.
*   Performance tuning for your hardware.
*   **Document History:** All parsed quizzes are automatically saved for future review
*   **Mobile Practice:** Download any quiz as an HTML file to study on your phone

> **Performance Note:** On a Ryzen 5 5600, parsing 10 questions takes approximately 30 seconds.

## Important: Format Your Document Correctly

For the AI to parse your questions accurately, **you must separate each MCQ with a blank line.** This prevents "hallucination" and ensures stable operation.
For example:

- **Bad Format Example:** doesn't separate between each MCQs as well as has blank lines between options (not working)

<div align="center">
  <img src="https://i.imgur.com/KB6Ne00.png"  alt="Bad document.">
</div>

</br>

- **Good Format Example:**
<div align="center">
  <img src="https://i.imgur.com/zaxwpsC.png"  alt="Excellent document.">
</div>


## Installation

#### Requirements:

* Python 3.10+
* C compiler (required for `llama-cpp-python`)
    * **Linux:** `gcc` or `clang`
    * **Windows:** Visual Studio (see detailed instructions below)
    * **macOS:** `Xcode Command Line Tools`

#### To run the project:

1. Clone the Repository (LLM size is ~900MB may take a long time to download)
```bash
git clone https://github.com/fadhl0/quiz-ai.git
cd quiz-ai
cd quiz_flask
```

Then run these commands based on your operating system
<details>
<summary>Linux/macOS</summary>

3. Create a Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

4. Install Dependencies

```bash
pip install -r requirements.txt
```

5. Run the application

```bash
python3 app.py
```

</details>

<details>
<summary>Windows</summary>

**Important note:** you **MUST** install Visual Studio with the "Desktop development with C++" workload, you can download it from the [link](https://visualstudio.microsoft.com/vs/older-downloads/) (choose the community edition).

During installation do not forget to select "Desktop development with C++", and ensure these components are checked:

* MSVC latest version
* Windows 11 SDK
* MSVC v143
* C++ CMAKE tools for Windows

**After installing Visual Studio run these commands:**

3. Create a Virtual Environment

```cmd
python -m venv venv
venv\Scripts\activate
```

4. Install Dependencies

```cmd
pip install -r requirements.txt
```

5. Run the application

```cmd
python app.py
```

</details>

## Boost the performance
By default, the LLM runs on your CPU. You can adjust the number of threads for better performance.

1. Open quiz_flask/LLM.py.
2. Find the Llama model initialization.
3. Change the `n_threads` parameter to match your CPU's physical core count.

```python
llm = Llama(
    model_path=path,
    n_ctx=4096,
    n_threads=4, # number of threads
    chat_format="qwen"
)
```

#### Using GPU (Faster Inference)
For GPU acceleration, you need to reinstall llama-cpp-python with GPU support.
For more information, you can visit this [repository](https://github.com/abetlen/llama-cpp-python). 

## Google Colab
The application uses a quantized language model via llama.cpp. For details on the fine-tuning process and model selection, you can explore [my Google Colab notebook](https://colab.research.google.com/drive/1CXJJoTeSN71NmqeW_F8kNY4EcpuGGScp?usp=sharing).


## Troubleshooting
"Failed to build llama-cpp-python": Ensure your C compiler (Visual Studio on Windows, Xcode on macOS, gcc on Linux) is correctly installed.

ModuleNotFoundError: Ensure your virtual environment is activated and you ran pip install -r requirements.txt.

AI gives bad result: Double-check that your document matches the 'Good Format Example' above. The AI relies on consistent structure to read your data accurately

## License
This project is licensed under the terms of the MIT license.
