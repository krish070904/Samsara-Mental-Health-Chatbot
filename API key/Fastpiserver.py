# FREE API - Flask + Ngrok
!pip install flask pyngrok -q

from flask import Flask, request, jsonify
from pyngrok import ngrok
import torch

# Your ngrok authtoken
ngrok.set_auth_token("363wbdE7ppj8mSOMiFJpV7te6hG_6vkUhS3GwazfwGEev4Qy8")

app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    msg = data.get('message', '')
    prompt = f"<s>[INST] You are a mental health therapist.\n\nUser: {msg} [/INST]"
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    with torch.no_grad():
        out = model.generate(**inputs, max_new_tokens=200, temperature=0.7, do_sample=True, pad_token_id=tokenizer.eos_token_id)
    resp = tokenizer.decode(out[0], skip_special_tokens=True).split("[/INST]")[-1].strip()
    return jsonify({"response": resp})

@app.route('/health')
def health():
    return jsonify({"status": "ok"})

url = ngrok.connect(5000)
print(f"\n{'='*50}")
print("FREE API READY!")
print(f"{'='*50}")
print(f"\nYour API URL: {url}")
print(f"\nChat endpoint: {url}/chat")
print(f"Health check: {url}/health")
print(f"\nExample:")
print(f'curl -X POST {url}/chat -H "Content-Type: application/json" -d \'{{"message":"I feel anxious"}}\'"')
print(f"{'='*50}\n")
app.run(port=5000)