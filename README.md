# 📚 Quiz AI-Powered Web application
A lightweight web application that lets you upload document containing Multiple-Choice Questions (MCQs) to test yourself. The app uses a local LLM (Large Language Model) to parse your document and power the interactive quiz.

## Snapshot

https://github.com/user-attachments/assets/a4ef3816-f859-40b2-8ad8-a8e7da1e3203


**Features:**
*   Upload `.docx` or `.txt` files with MCQs.
*   Local AI processing.
*   Simple web interface built with Flask.
*   Performance tuning for your hardware.
*   **Document History:** All parsed quizzes are automatically saved for future review
*   **Mobile Practice:** Download any quiz as an HTML file to study on your phone

> **Performance Note:** On a Ryzen 5 5600, parsing 10 questions takes approximately 30 seconds.

## Important: Format Your Document Correctly

For the AI to parse your questions accurately, **you must separate each MCQ with a blank line.** This prevents "hallucination" and ensures stable operation.
For example:

- **Bad Format Example:** doesn't separate individual MCQs as well as has blank lines between options (not working)

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
    * **Windows:** If you download the project from the release tab, you don't need a C compiler.

#### To run the project:

Navigate to the **Release** tab and download the version for your operating system.

For example: if **Linux** download `quiz_linux.tar.gz`, if **Windows** download `Quiz_windows.zip`.

<details>
<summary>Linux</summary>
  
1. Unzip the file:
   
```bash
mkdir quiz-ai
tar -xvf quiz_linux.tar.gz -C quiz-ai/
```

2. Add execution permission to the setup

```bash
cd quiz-ai
chmod +x setup.sh
```

3. Then run the application:
   
```bash
./setup.sh
```
</details>

<details>
<summary>Windows</summary>

- Unzip the file -> Double-click on `setup.bat`.

</details>

While script is running, it'll display some options for runtime:

|Option|Backend|Best For...|
| --- | --- | --- |
|1|Nvidia (CUDA)|Users with Nvidia GPUs and CUDA installed.|
|2|Universal (Vulkan)|Modern GPUs without specific drivers (Intel/AMD/Nvidia).|
|3|CPU (OpenBLAS)|Older hardware or systems without a dedicated GPU.|
|4|hipBLAS (ROCm)|AMD GPU users with ROCm installed.|
|5|Native|Default installation without specific optimizations.|

**Then You must wait until all packages and the AI model download.**

## Change runtime and tensor type on `settings.json`

If you want to switch the compilation process between CPU and GPU, navigate to quiz-ai/quiz-flask, and you'll find settings.json.

```json
{
  "GPU": "1",
  "type": "q4"
}
```

- GPU: `0` for CPU, `1` for GPU acceleration.

- Type: `q4` (Fast/Standard) or `f16` (High accuracy/Heavy).

**Note**: Switching to `f16` triggers a ~3GB download.

## Google Colab
The application uses a quantized language model via llama.cpp. For details on the fine-tuning process and model selection, you can explore [my Google Colab notebook](https://colab.research.google.com/drive/1CXJJoTeSN71NmqeW_F8kNY4EcpuGGScp?usp=sharing).

[Update] The new notebook that was used in the [recent update](https://colab.research.google.com/drive/1avIlszTztDYCw4isqdu3lhdTv9ADnB0G?usp=sharing).

## Troubleshooting
"The server did not respond": Double-check that your script (.sh or .bat) is running; as you close the terminal, the application will not work.

AI gives bad result: Double-check that your document matches the 'Good Format Example' above. The AI relies on consistent structure to read your data accurately

## License
This project is licensed under the terms of the MIT license.
