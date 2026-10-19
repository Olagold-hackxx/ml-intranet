# Curriculum

Generated from `data/` by `scripts/curriculum-md.mjs`. Days are the 6-month solo-track durations; the 12-month combined program stretches each track to run in parallel.

## Applied ML — 50 projects, 330 tasks, 154 days


### Phase 1 — Foundations

| ID | Project | Days | Lectures | Tasks (mandatory / advanced / written) | Repo / dir |
|---|---|---|---|---|---|
| A01 | Linear Regression, Gradient Descent & Normal Equations | 3 | CS229 Lec 1–2 | 7 / 1 / 1 | `ml-foundations/0x00-linear_regression` |
| A02 | Logistic Regression & Newton's Method | 3 | CS229 Lec 3–4 | 7 / 1 / 1 | `ml-foundations/0x01-logistic_regression` |
| A03 | GLMs, Generative Learning & Naive Bayes | 3 | CS229 Lec 5–6; CS221 Lec 1 | 7 / 1 / 2 | `ml-foundations/0x02-generative_learning` |
| A04 | Kernels & Support Vector Machines (SMO) | 4 | CS229 Lec 7–8 | 6 / 2 / 2 | `ml-foundations/0x03-svm` |
| A05 | Bias/Variance, Regularization & ML Debugging | 2 | CS229 Lec 9–10 | 6 / 1 / 1 | `ml-foundations/0x04-bias_variance` |
| A06 | Decision Trees & Ensembles | 2 | CS229 Lec 11–12 | 6 / 1 / 1 | `ml-foundations/0x05-trees_ensembles` |
| A07 | Neural Networks & Backprop in NumPy | 3 | CS229 Lec 11–13 | 8 / 1 / 1 | `ml-foundations/0x06-mlp_numpy` |
| A08 | Unsupervised Learning: k-means, EM & PCA | 3 | CS229 Lec 14–15; CS221 Unsupervised learning / k-means lecture | 6 / 1 / 1 | `ml-foundations/0x07-unsupervised` |
| A09 | Search, MDPs & Value Iteration | 3 | CS221 Search I–II, MDPs I–II; CS229 Lec 16–18 | 7 / 1 / 1 | `ml-foundations/0x08-mdp_value_iteration` |
| A10 | Phase 1 Mini-project: Three Classical Models on a Kaggle Dataset | 3 | CS229 Lec 9–10 (revisit) | 7 / 1 / 2 | `ml-foundations/0x09-classical_miniproject` |

### Phase 2 — Deep Learning Core

| ID | Project | Days | Lectures | Tasks (mandatory / advanced / written) | Repo / dir |
|---|---|---|---|---|---|
| A11 | PyTorch Fundamentals: MLP on Fashion-MNIST | 2 | CS230 Lec 1–2 | 6 / 1 / 1 | `ml-deep-learning/0x00-pytorch_mlp` |
| A12 | Linear Classifiers: Softmax & SVM Loss on CIFAR-10 | 3 | CS231N Lec 1–3 | 7 / 1 / 1 | `ml-deep-learning/0x01-linear_classifiers` |
| A13 | Backprop & CNN Layers from Scratch | 4 | CS231N Lec 4–5 | 8 / 1 / 1 | `ml-deep-learning/0x02-cnn_from_scratch` |
| A14 | Training Neural Networks: Init, Normalization, Optimizers | 3 | CS231N Lec 6–7; CS230 Lec 3 | 7 / 1 / 1 | `ml-deep-learning/0x03-training_nns` |
| A15 | CNN Architectures: Reproduce ResNet-18 on CIFAR-10 | 4 | CS231N Lec 8–9 | 6 / 1 / 1 | `ml-deep-learning/0x04-resnet` |
| A16 | Detection & Segmentation | 3 | CS231N Lec 10; CS231N Lec 11 | 7 / 1 / 1 | `ml-deep-learning/0x05-detection_segmentation` |
| A17 | Visualizing & Understanding CNNs | 2 | CS231N Lec 12–13; CS230 Case-study lectures | 6 / 1 / 1 | `ml-deep-learning/0x06-visualizing_cnns` |
| A18 | Vision Transformers & Self-Supervised Learning | 2 | CS231N Later lectures (Attention & Transformers, Self-supervised learning) | 5 / 1 / 1 | `ml-deep-learning/0x07-vit_ssl` |
| A19 | Phase 2 Project: End-to-End Deployed Vision App | 4 | CS230 Full-cycle deep learning project lecture + remaining case studies | 7 / 1 / 2 | `ml-deep-learning/0x08-vision_app` |

### Phase 3 — Sequence Models & NLP

| ID | Project | Days | Lectures | Tasks (mandatory / advanced / written) | Repo / dir |
|---|---|---|---|---|---|
| A20 | Word Vectors: word2vec from Scratch | 3 | CS224N Lec 1–2 | 7 / 1 / 1 | `ml-nlp/0x00-word2vec` |
| A21 | Neural Dependency Parsing (Arc-Standard) | 3 | CS224N Lec 3–4 | 7 / 1 / 1 | `ml-nlp/0x01-dependency_parsing` |
| A22 | RNN & LSTM Language Models | 3 | CS224N Lec 5–6 | 5 / 1 / 1 | `ml-nlp/0x02-rnn_lstm` |
| A23 | Seq2Seq with Attention | 3 | CS224N Lec 7–8 | 6 / 1 / 1 | `ml-nlp/0x03-seq2seq_attention` |
| A24 | The Transformer from Scratch | 5 | CS224N Lec 9; CME295 Lec 1–2 | 8 / 1 / 2 | `ml-nlp/0x04-transformer` |
| A25 | Pretraining & Fine-tuning: BERT, GPT, T5 | 3 | CS224N Lec 10–11 | 6 / 1 / 2 | `ml-nlp/0x05-pretraining_finetuning` |
| A26 | Modern Transformer Internals: RoPE, KV-Cache, Efficient Attention | 3 | CME295 Lec 3–4 | 5 / 1 / 1 | `ml-nlp/0x06-rope_kvcache` |
| A27 | Retrieval-Augmented Question Answering | 3 | CS224N Lec 12–13; CS224U Intro lectures | 6 / 1 / 1 | `ml-nlp/0x07-rag_qa` |
| A28 | Sentence Embeddings & Semantic Search | 2 | CS224U Sentence meaning, grounded language, retrieval & embeddings lectures | 6 / 1 / 1 | `ml-nlp/0x08-semantic_search` |
| A29 | LLM Agents & Tool Use | 3 | CME295 Agents, tool use & multimodal lectures | 5 / 1 / 1 | `ml-nlp/0x09-agents` |

### Phase 4 — Generative Models & RL

| ID | Project | Days | Lectures | Tasks (mandatory / advanced / written) | Repo / dir |
|---|---|---|---|---|---|
| A30 | Autoregressive Models: PixelCNN | 3 | CS236 Lec 1–2 | 5 / 1 / 1 | `ml-generative-rl/0x00-pixelcnn` |
| A31 | Variational Autoencoders | 3 | CS236 Lec 3–4 | 5 / 1 / 1 | `ml-generative-rl/0x01-vae` |
| A32 | Normalizing Flows & GANs | 3 | CS236 Lec 5–6 | 5 / 1 / 1 | `ml-generative-rl/0x02-flows_gans` |
| A33 | Diffusion Models: DDPM from Scratch | 4 | CS236 Lec 7–9; CME296 Lec 1–2 | 5 / 1 / 1 | `ml-generative-rl/0x03-ddpm` |
| A34 | Latent Diffusion & Guidance | 2 | CME296 Lec 3–5 | 4 / 1 / 1 | `ml-generative-rl/0x04-latent_diffusion` |
| A35 | Tabular RL: Policy Iteration, MC, TD & Q-learning | 3 | CS234 Lec 1–2; CS234 Lec 3–4 | 5 / 1 / 1 | `ml-generative-rl/0x05-tabular_rl` |
| A36 | Deep Q-Networks | 3 | CS234 Lec 5–7 | 4 / 1 / 1 | `ml-generative-rl/0x06-dqn` |
| A37 | Policy Gradients, Actor-Critic & PPO | 4 | CS234 Lec 8–10 | 5 / 1 / 1 | `ml-generative-rl/0x07-policy_gradients` |
| A38 | RLHF: Preference Learning & Reward Models | 2 | CS329H Lec 1–3 | 4 / 1 / 2 | `ml-generative-rl/0x08-rlhf_reward_models` |
| A39 | Direct Preference Optimization | 3 | CS329H Lec 4–6 | 5 / 1 / 2 | `ml-generative-rl/0x09-dpo` |

### Phase 5 — Frontier & Systems

| ID | Project | Days | Lectures | Tasks (mandatory / advanced / written) | Repo / dir |
|---|---|---|---|---|---|
| A40 | Byte-Pair Encoding Tokenizer from Scratch | 3 | CS336 Lec 1–2 | 3 / 1 / 1 | `ml-frontier/0x00-bpe_tokenizer` |
| A41 | Modern LM Architecture & Mixed Precision | 3 | CS336 Lec 3–4 | 5 / 1 / 0 | `ml-frontier/0x01-modern_lm` |
| A42 | Training Systems: Memory, Kernels & Parallelism | 2 | CS336 Lec 5–6 | 3 / 1 / 1 | `ml-frontier/0x02-training_systems` |
| A43 | Scaling Laws: Train a Small LM | 4 | CS336 Lec 7–8 | 4 / 1 / 1 | `ml-frontier/0x03-scaling_laws` |
| A44 | Post-training at LM Scale: SFT & DPO | 3 | CS336 Lec 9–10 | 5 / 1 / 1 | `ml-frontier/0x04-post_training` |
| A45 | LLM Evaluation: Benchmarks & Contamination | 3 | EVAL Evaluation fundamentals | 4 / 1 / 1 | `ml-frontier/0x05-llm_evaluation` |
| A46 | LLM-as-Judge, Reliability & Red-Teaming | 2 | EVAL LLM-as-judge & reliability | 4 / 1 / 1 | `ml-frontier/0x06-llm_judge` |
| A47 | Compute-Optimal Training: Chinchilla | 2 | EVAL Scaling laws in depth | 3 / 1 / 2 | `ml-frontier/0x07-chinchilla` |
| A48 | Capstone I: Proposal | 2 | CS336 Review; EVAL Review | 4 / 1 / 4 | `ml-capstone/0x00-proposal` |
| A49 | Capstone II: Milestone | 6 | CS336 As needed; EVAL As needed | 5 / 1 / 1 | `ml-capstone/0x01-milestone` |
| A50 | Capstone III: Final Report & Portfolio | 7 | CS336 As needed; EVAL As needed | 5 / 1 / 4 | `ml-capstone/0x02-final` |

## Theoretical ML — 27 projects, 187 tasks, 154 days


### Pass 1 — Classical Statistical Learning Theory

| ID | Project | Days | Lectures | Tasks (mandatory / advanced / written) | Repo / dir |
|---|---|---|---|---|---|
| T01 | Prerequisites: Probability, Concentration & Linear Algebra | 5 | BD Lec 1 | 6 / 2 / 6 | `ml-theory/0x00-prerequisites` |
| T02 | A Gentle Start: ERM & Finite Hypothesis Classes | 4 | BD Lec 1–2 | 6 / 1 / 5 | `ml-theory/0x01-erm_finite_classes` |
| T03 | PAC Learning: Realizable & Agnostic | 5 | BD Lec 3–4 | 6 / 1 / 5 | `ml-theory/0x02-pac_learning` |
| T04 | Learning via Uniform Convergence | 4 | BD Lec 5 | 5 / 1 / 4 | `ml-theory/0x03-uniform_convergence` |
| T05 | Bias–Complexity Tradeoff & No Free Lunch | 5 | BD Lec 6 | 7 / 1 / 6 | `ml-theory/0x04-no_free_lunch` |
| T06 | VC Dimension & the Sauer–Shelah Lemma | 6 | BD Lec 7–8 | 7 / 2 / 7 | `ml-theory/0x05-vc_dimension` |
| T07 | The Fundamental Theorem of Statistical Learning | 8 | BD Lec 9 | 7 / 2 / 7 | `ml-theory/0x06-fundamental_theorem` |
| T08 | Nonuniform Learnability, SRM & MDL | 5 | BD Lec 10 | 6 / 1 / 5 | `ml-theory/0x07-srm_mdl` |
| T09 | Computational Complexity of Learning | 4 | BD Lec 11 | 6 / 1 / 5 | `ml-theory/0x08-computational_complexity` |
| T10 | Linear Predictors & Boosting | 6 | BD Lec 12–13 | 7 / 1 / 6 | `ml-theory/0x09-linear_boosting` |
| T11 | Model Selection, Validation & Convex Learning Problems | 5 | BD Lec 14 | 6 / 1 / 5 | `ml-theory/0x0A-validation_convexity` |
| T12 | Regularization, Stability & SGD | 6 | BD Lec 15 | 6 / 1 / 5 | `ml-theory/0x0B-stability_sgd` |
| T13 | SVMs & Kernel Methods | 5 | BD Lec 16 | 6 / 1 / 5 | `ml-theory/0x0C-svm_kernels` |
| T14 | Pass 1 Synthesis: What Is the Fundamental Theorem Really Saying? | 5 | BD Lec 9; BD Lec 16 | 5 / 1 / 3 | `ml-theory/0x0D-pass1_synthesis` |

### Pass 2 — Modern Learning Theory

| ID | Project | Days | Lectures | Tasks (mandatory / advanced / written) | Repo / dir |
|---|---|---|---|---|---|
| T15 | Asymptotic Statistics & the MLE | 5 | CS229M Lec 1–2 | 6 / 1 / 5 | `ml-theory/0x0E-asymptotics_mle` |
| T16 | Concentration Inequalities | 7 | CS229M Lec 3 | 5 / 1 / 4 | `ml-theory/0x0F-concentration` |
| T17 | Uniform Convergence & Rademacher Complexity | 6 | CS229M Lec 4 | 5 / 1 / 4 | `ml-theory/0x10-rademacher` |
| T18 | Covering Numbers & Dudley's Chaining | 6 | CS229M Lec 5 | 5 / 1 / 4 | `ml-theory/0x11-covering_chaining` |
| T19 | Margin Theory | 5 | CS229M Lec 6; BD Lec 16 | 5 / 1 / 4 | `ml-theory/0x12-margin_theory` |
| T20 | Kernel Methods & RKHS Generalization | 5 | CS229M Lec 7 | 4 / 2 / 4 | `ml-theory/0x13-rkhs` |
| T21 | Non-convex Optimization Landscapes | 5 | CS229M Lec 8 | 5 / 1 / 4 | `ml-theory/0x14-nonconvex` |
| T22 | Implicit Regularization of Gradient Descent | 8 | CS229M Lec 9 | 5 / 2 / 5 | `ml-theory/0x15-implicit_bias` |
| T23 | Neural Tangent Kernel & Lazy Training | 7 | CS229M Lec 10 | 5 / 1 / 4 | `ml-theory/0x16-ntk` |
| T24 | Double Descent & Benign Overfitting | 5 | CS229M Lec 11; BD Lec 6 | 4 / 2 / 4 | `ml-theory/0x17-double_descent` |
| T25 | Online Learning & Regret Minimization | 7 | CS229M Lec 12 | 5 / 1 / 4 | `ml-theory/0x18-online_learning` |
| T26 | Proof Portfolio & Concentration Cheat Sheet | 5 | CS229M Lec 3–12 (review); BD Lec 9 | 7 / 1 / 6 | `ml-theory/0x19-proof_portfolio` |
| T27 | Capstone: Critique of a Recent Theory Paper | 10 | CS229M Lec 13+ | 7 / 1 / 6 | `ml-theory/0x1A-capstone_critique` |

