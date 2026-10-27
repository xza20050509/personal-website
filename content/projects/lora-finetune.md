# 大模型 LoRA 微调训练

## 项目简介

基于 Hugging Face 生态的大模型 LoRA 高效微调实践，涵盖数据处理、模型训练、推理部署全流程。

## 技术栈

- Python
- Hugging Face Transformers
- PEFT（LoRA）
- bitsandbytes（4bit 量化）
- vLLM（推理部署）

## 实现内容

1. **数据准备**：JSONL 格式的指令-回答对，统一分词处理
2. **模型量化加载**：4bit 量化加载预训练模型，降低显存占用
3. **LoRA 配置**：在注意力层注入低秩矩阵，r=16，仅训练 0.1% 参数
4. **模型训练**：FP16 混合精度训练，3 个 epoch
5. **权重合并**：将 LoRA 权重合并回基础模型
6. **推理部署**：用 vLLM 部署为 OpenAI 兼容 API

## 关键代码

### LoRA 配置

```python
from peft import LoraConfig

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    task_type="CAUSAL_LM"
)
```

### 推理

```python
from peft import PeftModel

model = AutoModelForCausalLM.from_pretrained(base_model_name, device_map="auto")
model = PeftModel.from_pretrained(model, "./lora-output")
model = model.merge_and_unload()
```

## 收获

- 理解了 LoRA 低秩适配的原理与优势
- 掌握了大模型量化训练的显存优化技巧
- 深刻体会到"数据质量 > 模型规模"的重要性
- 学会了从训练到部署的完整工程链路

## 相关文章

详见博客《[大模型 LoRA 微调初体验](post.html?id=003-lora-finetune)》。
