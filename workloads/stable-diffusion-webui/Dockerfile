# Use an Ubuntu base image
FROM ubuntu:latest

# Install pre-requisites
RUN apt-get update && \
    apt-get install -y wget git python3 python3-venv libgl1 libglib2.0-0 && \
    curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash && \
    apt-get install -y git-lfs && \
    git lfs install

# Create a new user "myuser" and set the home directory
RUN useradd -m controlnet

# Switch to the new user
USER controlnet
# Set the working directory
WORKDIR /home/controlnet

# Clone required repos
RUN git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git && \
    git clone https://github.com/Mikubill/sd-webui-controlnet.git stable-diffusion-webui/extensions/sd-webui-controlnet && \
    git clone https://huggingface.co/lllyasviel/ControlNet-v1-1 && \
    git clone https://huggingface.co/lllyasviel/sd_control_collection

# Move models into the requisite directories
RUN mv ControlNet-v1-1/*.pth stable-diffusion-webui/extensions/sd-webui-controlnet/models && \
    mv ControlNet-v1-1/*.yaml stable-diffusion-webui/extensions/sd-webui-controlnet/models && \
    mv sd_control_collection/*.safetensors stable-diffusion-webui/extensions/sd-webui-controlnet/models

# Set the working directory
WORKDIR /home/controlnet/stable-diffusion-webui

# Command to run the service
CMD ["./webui.sh", "--share"]

