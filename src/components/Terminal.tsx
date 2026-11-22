import { useMemo, useState, type FormEvent } from 'react';
import { profile } from '../data/profile';

const helpText = [
  'Available commands:',
  '  help       Show available commands',
  '  about      Display developer profile',
  '  skills     List technical skills',
  '  projects   Show featured projects',
  '  contact    Display contact links',
  '  clear      Clear terminal output',
];

export function Terminal() {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([
    'PRITAM OS Terminal [Version 1.0.0]',
    'A small command line for exploring this portfolio.',
    'Type "help" to see what you can do.',
    '',
  ]);
  const commands = useMemo(() => ({
    help: helpText,
    about: [profile.name, profile.headline, profile.summary],
    skills: profile.skills.map((group) => `${group.group}: ${group.items.join(', ')}`),
    projects: profile.projects.map((project) => `• ${project.name} — ${project.status}`),
    contact: [`Email: ${profile.email}`, `GitHub: ${profile.github}`, `LinkedIn: ${profile.linkedin}`],
  }), []);

  function runCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = command.trim();
    if (!value) return;
    const normalized = value.toLowerCase();
    if (normalized === 'clear') {
      setHistory([]);
      setCommand('');
      return;
    }
    const response = normalized in commands
      ? commands[normalized as keyof typeof commands]
      : [`Command not found: ${value}`, 'Type "help" to see available commands.'];
    setHistory((current) => [...current, `pritam@portfolio:~$ ${value}`, ...response, '']);
    setCommand('');
  }

  return (
    <div className="terminal-shell">
      <div className="terminal-output" aria-live="polite">
        {history.map((line, index) => (
          <div className={line.startsWith('pritam@') ? 'terminal-command' : 'terminal-line'} key={`${index}-${line}`}>
            {line || '\u00a0'}
          </div>
        ))}
      </div>
      <form className="terminal-input-row" onSubmit={runCommand}>
        <span>pritam@portfolio:~$</span>
        <input
          aria-label="Terminal command"
          autoComplete="off"
          spellCheck={false}
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder="type a command..."
        />
      </form>
    </div>
  );
}
