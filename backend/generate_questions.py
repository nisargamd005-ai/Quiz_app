import sqlite3
import json
import random

TEMPLATES = {
    "HTML": [
        ("Which attribute is used to define the {} of an {element}?", ["src", "href", "alt", "title"]),
        ("What is the correct tag for a {} heading?", ["<h1>", "<h2>", "<h3>", "<h4>"]),
        ("Which element defines a {} list?", ["<ul>", "<ol>", "<li>", "<dl>"]),
        ("How do you create a {} element?", ["<div>", "<span>", "<p>", "<section>"])
    ],
    "CSS": [
        ("Which property is used to change the {} of an element?", ["color", "background", "margin", "padding"]),
        ("How do you select an element with id '{}'?", ["#{}", ".{}", "{}", "*{}"]),
        ("Which value for 'display' makes an element a {}?", ["block", "inline", "flex", "grid"]),
    ],
    "JavaScript": [
        ("Which method is used to {} an array?", ["push()", "pop()", "shift()", "slice()"]),
        ("How do you declare a {} variable?", ["let", "const", "var", "function"]),
        ("What does the {} operator do?", ["==", "===", "!=", "typeof"]),
    ],
    "Python": [
        ("Which keyword is used to define a {}?", ["def", "class", "import", "lambda"]),
        ("How do you {} a list in Python?", ["append()", "remove()", "pop()", "extend()"]),
        ("What is the output of type({})?", ["str", "int", "list", "dict"]),
    ],
    "SQL": [
        ("Which SQL keyword is used to {} data?", ["SELECT", "UPDATE", "DELETE", "INSERT"]),
        ("How do you sort the result using '{}'?", ["ORDER BY {}", "GROUP BY {}", "WHERE {}", "HAVING {}"]),
    ],
    "React": [
        ("Which Hook is used to manage {} in functional components?", ["useState", "useEffect", "useContext", "useRef"]),
        ("How do you pass {} to a component?", ["props", "state", "context", "children"]),
    ]
}

FILLERS = {
    "HTML": ["source", "link", "paragraph", "division", "span", "bold", "italic", "primary", "navigation", "footer"],
    "CSS": ["background", "font-size", "margin", "padding", "border", "flexbox", "grid", "color", "opacity", "shadow"],
    "JavaScript": ["add to", "remove from", "iterate", "slice", "concatenate", "map", "filter", "reduce", "bind", "call"],
    "Python": ["function", "class", "module", "dictionary", "tuple", "set", "array", "generator", "decorator", "exception"],
    "SQL": ["retrieve", "filter", "sort", "group", "join", "delete", "insert", "update", "count", "average"],
    "React": ["state", "side effects", "context", "refs", "callbacks", "memoization", "props", "children", "reducers", "layout"]
}

def generate():
    conn = sqlite3.connect("quiz_master.db")
    c = conn.cursor()
    count = 0
    for topic in ["HTML", "CSS", "JavaScript", "Python", "SQL", "React"]:
        c.execute("SELECT COUNT(*) FROM questions WHERE category=?", (topic,))
        current = c.fetchone()[0]
        needed = 100 - current
        if needed <= 0: continue
        templates = TEMPLATES[topic]
        fillers = FILLERS[topic]
        for _ in range(needed):
            temp_idx = random.randint(0, len(templates)-1)
            q_tmpl, opts_tmpl = templates[temp_idx]
            filler = random.choice(fillers)
            question_text = q_tmpl.replace("{}", filler).replace("{element}", "HTML tag")
            raw_options = []
            for o in opts_tmpl: raw_options.append(o.replace("{}", filler))
            random.shuffle(raw_options)
            options_json = json.dumps([{"id": k, "text": raw_options[i]} for i, k in enumerate(["a", "b", "c", "d"])])
            original_correct_text = opts_tmpl[0].replace("{}", filler)
            correct_choice = "a"
            for i, val in enumerate(raw_options):
                if val == original_correct_text:
                    correct_choice = ["a", "b", "c", "d"][i]
                    break
            c.execute("INSERT INTO questions (question, options, correct_answer, explanation, category, difficulty, hint, type) VALUES (?,?,?,?,?,?,?,?)",
                      (question_text, options_json, correct_choice, f"The correct usage involves '{original_correct_text}'.", topic, random.choice(["Easy", "Medium", "Hard"]), "Think about the main syntax.", "mcq"))
            count += 1
    conn.commit()
    conn.close()
    print(f"Restored and generated {count} questions.")

if __name__ == "__main__": generate()
