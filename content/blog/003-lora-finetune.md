# 大模型 LoRA 微调初体验

## 前言

课程实训中接触到大模型微调，一开始觉得"微调 = 重新训练"，工作量巨大。直到了解了 LoRA（Low-Rank Adaptation），才发现可以用极少的算力让大模型学会特定领域的知识。这篇笔记记录完整的实践流程。

## 什么是 LoRA

LoRA 的核心思想：**冻结预训练模型的所有权重，只在 Transformer 的每一层注入可训练的低秩矩阵**。

```
原始权重 W (d×k) → 冻结
新增 A (d×r) 和 B (r×k) → 训练
输出 = Wx + BAx
```

其中 `r`（rank）通常取 4-64，远小于 `d` 和 `k`。

**优势**：
- 参数量小：只训练 0.1%-1% 的参数
- 显存省：不需要为整个模型计算梯度
- 切换快：加载不同 LoRA 权重即可切换模型"人格"

## 环境准备

```bash
pip install torch transformers datasets peft accelerate bitsandbytes
```

| 库 | 用途 |
|---|---|
| transformers | 加载预训练模型 |
| datasets | 加载与处理数据集 |
| peft | LoRA 实现 |
| accelerate | 分布式训练 |
| bitsandbytes | 模型量化（4bit/8bit） |

## 数据处理

### 1. 准备数据

数据格式：输入-输出对，JSONL 格式：

```json
{"instruction": "解释什么是物联网", "output": "物联网是..."}
{"instruction": "LoRA 的优势是什么", "output": "LoRA 的优势包括..."}
```

### 2. 加载与分词

```python
from datasets import load_dataset
from transformers import AutoTokenizer

model_name = "Qwen/Qwen2-1.5B"
tokenizer = AutoTokenizer.from_pretrained(model_name)

dataset = load_dataset("json", data_files="train.jsonl")

def format_example(example):
    return f"指令：{example['instruction']}\n回答：{example['output']}"

def tokenize(example):
    text = format_example(example)
    result = tokenizer(text, truncation=True, max_length=512, padding="max_length")
    result["labels"] = result["input_ids"].copy()
    return result

tokenized_dataset = dataset.map(tokenize, remove_columns=dataset["train"].column_names)
```

### 3. 数据质量的重要性

> 训出来的模型效果差，90% 是数据问题。

实训中踩过的坑：
- 数据量太少（<100 条）→ 模型过拟合，只会背答案
- 回答格式不统一 → 输出混乱
- 指令模糊 → 模型学不到规律

**建议**：至少 200-500 条高质量数据，格式统一，覆盖目标场景的多种表达。

## 模型加载与量化

为了在消费级显卡上训练，用 4bit 量化加载模型：

```python
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16
)

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    device_map="auto"
)
```

## LoRA 配置

```python
from peft import LoraConfig, get_peft_model

lora_config = LoraConfig(
    r=16,                    # 秩，越大表达能力越强但参数越多
    lora_alpha=32,           # 缩放因子，通常设为 r 的 2 倍
    target_modules=["q_proj", "v_proj"],  # 注入位置
    lora_dropout=0.05,
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# 输出类似：trainable params: 1,671,168 || all params: 1,543,899,648 || trainable%: 0.1083
```

## 训练

```python
from transformers import TrainingArguments, Trainer

training_args = TrainingArguments(
    output_dir="./lora-output",
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    num_train_epochs=3,
    logging_steps=10,
    save_strategy="epoch",
    fp16=True,
    report_to="none"
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
)

trainer.train()
```

### 关键超参数

| 参数 | 推荐值 | 说明 |
|---|---|---|
| r | 8-32 | 秩，简单任务 8 即可 |
| learning_rate | 1e-4 ~ 3e-4 | LoRA 学习率比全参数微调大 |
| epochs | 3-10 | 观察 loss 收敛情况 |
| batch_size | 4-16 | 受显存限制 |

## 推理部署

训练完成后，LoRA 权重保存在 `adapter_config.json` 和 `adapter_model.safetensors`。

### 合并权重推理

```python
from peft import PeftModel

base_model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto")
model = PeftModel.from_pretrained(base_model, "./lora-output/checkpoint-xxx")
model = model.merge_and_unload()  # 合并为单模型

inputs = tokenizer("解释什么是物联网", return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=200)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

### 部署为 API

用 [vLLM](https://github.com/vllm-project/vllm) 或 [Ollama](https://ollama.com/) 部署为推理服务，支持 OpenAI 兼容接口。

## 踩坑总结

1. **显存不足（OOM）**：减小 `batch_size`，开启 `gradient_accumulation_steps`，用 4bit 量化。
2. **训练 loss 不下降**：检查数据格式是否正确，学习率是否太大。
3. **输出胡言乱语**：数据质量问题，检查标注是否准确。
4. **推理结果与训练时不一致**：确保 `merge_and_unload()` 正确执行，推理时用相同的 tokenizer。
5. **训练太慢**：减少 `max_length`，用 `gradient_checkpointing` 节省显存（但会变慢）。

## 心得

LoRA 让"微调大模型"从实验室走向了普通开发者。实训中最大的收获不是技术本身，而是理解了**数据 > 模型 > 算法**这个道理——再先进的方法，没有高质量数据也训不出好模型。

下一步计划：
- 尝试更大的模型（7B）
- 学习多轮对话数据的格式
- 探索 QLoRA（量化 LoRA）
- 用 Gradio 做一个可交互的 demo
