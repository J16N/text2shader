'use client';

import styles from "./page.module.css";
import { useState } from "react";
import BotMessage from "./components/botMessage";

const SHADER_URL = `${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/shader`;

export default function Home() {
  const [value, setValue] = useState<string>("");
  const [model, setModel] = useState<string>("gemini");
  const [messages, setMessages] = useState<string[]>([]);

  const handleInput = async () => {
    setMessages([...messages, `U:>${value}`, `T:>Thinking`]);
    const msgs = [...messages, `U:>${value}`];

    try {
      const response = await fetch(`${SHADER_URL}/${model}?text=${value}`);

      if (!response.ok) {
        setMessages([...msgs, `E:>Something went wrong!`]);
        return;
      }

      const json = await response.json();
      if (json.status !== "Success") {
        setMessages([...msgs, `E:>${json.message}`]);
        return;
      }

      setMessages([...msgs, `B:>${model}$$${json.message}`]);

    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }
      setMessages([...msgs, `E:>Something went wrong!`]);
    }
  };

  return (
    <>
      <div className={styles.chatContainer}>
        <ul>
          {messages.map((message, index) => (
            <li
              key={index}
              data-type={
                message.startsWith("U:>") ? "user" :
                  message.startsWith("T:>") ? "bot-think" :
                    message.startsWith("E:>") ? "bot-think" : "bot"
              }
            >
              {
                message.startsWith("B:>") ?
                  <BotMessage
                    llm={message.slice(3, message.search(/\$\$/g))}
                  >{message.slice(message.search(/\$\$/g) + 2)}</BotMessage> : message.slice(3)
              }
              {message.startsWith("T:>") && <span className={styles.thinkAnimate}>...</span>}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.inputContainer}>
        <div className={styles.input}>
          <textarea
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoFocus
            rows={3}
            wrap="hard"
            placeholder="Request shader code..."
            onChange={e => {
              const newlines = (e.target.value.match(/\n/g) || []).length + 1;
              if (newlines > 2) {
                e.target.rows = newlines;
              }

              if (e.target.scrollWidth > e.target.clientWidth) {
                e.target.rows += 1;
              }

              setValue(e.target.value);
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (value.trim() === "" || (messages[messages.length - 1] ?? "").startsWith("T:>")) return;
                handleInput();
                setValue("");
                (e.target as HTMLTextAreaElement).value = "";
              }
            }}
          />
          <select className={styles.select} name="model" defaultValue="gemini" onChange={e => setModel(e.target.value)}>
            <option value="gemini">Gemini</option>
            <option value="claude">Claude</option>
          </select>
          <button
            className={styles.submitButton}
            onClick={e => {
              e.preventDefault();
              if (value.trim() === "" || (messages[messages.length - 1] ?? "").startsWith("T:>")) return;
              handleInput();
              setValue("");
              ((e.target as HTMLButtonElement).previousElementSibling as HTMLTextAreaElement).value = "";
            }}></button>

        </div>
      </div >
    </>
  );
}
