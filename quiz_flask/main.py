import os
import sys
import subprocess
import json
import shutil
import platform

def setup_portable_env():
    venv_path = sys.prefix
    scripts_folder = os.path.join(venv_path, "Scripts")

    dll_source = os.path.abspath("dependencies/libopenblas.dll")
    dll_destination = os.path.join(scripts_folder, "libopenblas.dll")
    if not os.path.exists(dll_source):
        print(f"Error: Could not find {dll_source}.")
        return

    try:
        shutil.copy2(dll_source, dll_destination)
    except PermissionError:
        print("Error: Permission denied. Try running the script as Admin.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

def linux_openblas():
    if shutil.which("apt"):  # Ubuntu/Debian
        subprocess.run("sudo apt update && sudo apt install -y libopenblas-dev", shell=True, check=True)

    elif shutil.which("pacman"):  # Arch Linux
        subprocess.run("sudo pacman -Sy --noconfirm openblas", shell=True, check=True)

    else:
        print("[!] Unsupported distro. Install OpenBLAS manually.")

def openblas():
    if platform.system() == "Linux":
        linux_openblas()
    elif platform.system() == "Windows":
        setup_portable_env()

def install_dependencies():
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])

    dependencies = ["huggingface_hub", "questionary"] 
    subprocess.check_call([sys.executable, "-m", "pip", "install"] + dependencies)


def download_from_hf(id, file):
    print("--- Downloading model from Hugging Face ---")
    from huggingface_hub import hf_hub_download

    try:
        file_path = hf_hub_download(
            repo_id=id, 
            filename=file,
            local_dir="../LLM"
        )
    except Exception as e:
        print(f"Hugging Face download failed: {e}")

def select_gpu():
    import questionary
    choices=[
        "Nvidia (CUDA)",
        "Universal (Vulkan)",
        "CPU (OpenBLAS)",
        "hipBLAS (ROCm)",
        "other (Native)"
    ]

    gpu = questionary.select(
        "Select Your Runtime Method:",
        choices=choices,
        use_indicator=True
    ).ask()

    return choices.index(gpu)

def hf_safe_install():
    settings_path = "settings.json"

    if not os.path.isfile(settings_path):
        print("[!] settings.json not found.")
        return

    try:
        with open(settings_path, "r") as jsonfile:
            data = json.load(jsonfile)
        
        llm_dir = os.path.join("..", "LLM")
        os.makedirs(llm_dir, exist_ok=True)

        tensor_type = data.get("type")
        if tensor_type == "f16":
            filename = "Qwen2.5-1.5B-Instruct.F16.gguf"
            repo = "Fadhl0/quiz-app-train-responses-f16"
        else:
            filename = "Qwen2.5-1.5B-Instruct.Q4_K_M.gguf"
            repo = "Fadhl0/quiz-app-4bit-native"

        target_path = os.path.join(llm_dir, filename)

        if not os.path.isfile(target_path):
            download_from_hf(repo, filename)
        
    except json.JSONDecodeError:
        print("[!] settings.json is not valid JSON.")
    except Exception as e:
        print(f"[!] An unexpected error occurred: {e}")

if __name__ == "__main__":
    if sys.argv[1] == "--ihf":
        hf_safe_install()

    elif sys.argv[1] == "--idep":
        install_dependencies()

    elif sys.argv[1] == "--hw":
        index = select_gpu()
        sys.exit(index + 1)
    
    elif sys.argv[1] == "--openblas":
        openblas()
    
    else:
        print("[!] Argument not supported.")
