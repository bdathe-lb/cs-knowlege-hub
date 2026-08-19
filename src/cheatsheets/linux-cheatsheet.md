---
title: "Linux 常用操作速查"
description: "基本流程："
---

## 命令转入后台运行

**基本流程：**

```text
运行命令 -> Ctrl+Z（暂停）-> bg（后台继续）-> disown（可选：脱离终端）
```

| 操作        | 说明                                         |
| ----------- | -------------------------------------------- |
| `Ctrl + Z`  | 暂停当前前台进程（挂起）                     |
| `bg`        | 让已暂停的作业在后台继续运行                 |
| `fg`        | 将后台作业带回前台                           |
| `fg %1`     | 将作业编号 1 带回前台                        |
| `jobs`      | 查看当前终端中的后台/停止作业                |
| `disown`    | 让后台作业脱离终端控制（关闭终端也不会终止） |

## 丢弃命令输出

`/dev/null` 是一个特殊设备文件，写入的数据会被直接丢弃，但写入操作被视为成功

```bash
# 方法一：Bash 4+ 简洁写法，同时丢弃 stdout 和 stderr
command &> /dev/null

# 方法二：最通用写法
command > /dev/null 2>&1
```

## 命令序列

```bash
cmd1 ; cmd2    # 顺序执行，不管前一个是否成功
cmd1 && cmd2   # 只有前一个成功才执行后一个
cmd1 || cmd2   # 只有前一个失败才执行后一个
```

## 参考资料

- [Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html)
- [TLDR pages](https://tldr.sh/)
