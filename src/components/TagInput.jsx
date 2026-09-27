import { useState } from 'react';
import { Form, Badge, InputGroup, Button } from 'react-bootstrap';

function TagInput({ tags, onChange, placeholder }) {
  const [draft, setDraft] = useState('');

  function commitDraft() {
    const value = draft.trim();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
    }
    setDraft('');
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commitDraft();
    } else if (event.key === 'Backspace' && !draft && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(index) {
    onChange(tags.filter((_, i) => i !== index));
  }

  return (
    <div>
      <InputGroup>
        <Form.Control
          placeholder={placeholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button variant="outline-secondary" onClick={commitDraft}>
          Add
        </Button>
      </InputGroup>
      {tags.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-2">
          {tags.map((tag, i) => (
            <Badge key={tag} bg="secondary" className="d-flex align-items-center gap-1">
              {tag}
              <span
                role="button"
                aria-label={`Remove ${tag}`}
                onClick={() => removeTag(i)}
                style={{ cursor: 'pointer' }}
              >
                &times;
              </span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default TagInput;
