# ARIA Patterns and Best Practices

## Overview

ARIA (Accessible Rich Internet Applications) provides attributes to enhance accessibility when native HTML semantics are insufficient. The first rule of ARIA is: don't use ARIA if native HTML can do the job.

## ARIA Fundamentals

### Roles

Roles define what an element is or does.

```tsx
// Widget roles
<div role="button">Click me</div>
<div role="checkbox" aria-checked="true">Option</div>
<div role="slider" aria-valuenow="50">Volume</div>

// Landmark roles (prefer semantic HTML)
<div role="main">...</div>      // Better: <main>
<div role="navigation">...</div> // Better: <nav>
<div role="banner">...</div>     // Better: <header>

// Document structure roles
<div role="region" aria-label="Featured">...</div>
<div role="group" aria-label="Formatting options">...</div>
```

### States and Properties

States indicate current conditions; properties describe relationships.

```tsx
// States (can change)
aria-checked="true|false|mixed"
aria-disabled="true|false"
aria-expanded="true|false"
aria-hidden="true|false"
aria-pressed="true|false"
aria-selected="true|false"

// Properties (usually static)
aria-label="Accessible name"
aria-labelledby="id-of-label"
aria-describedby="id-of-description"
aria-controls="id-of-controlled-element"
aria-owns="id-of-owned-element"
aria-live="polite|assertive|off"
```

## Common ARIA Patterns

### Accordion

```tsx
function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <div className="accordion">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const headingId = `accordion-heading-${index}`;
        const panelId = `accordion-panel-${index}`;

        return (
          <div key={index}>
            <h3>
              <button
                id={headingId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
              >
                {item.title}
                <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              hidden={!isOpen}
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Tabs

```tsx
function Tabs({ tabs }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabListRef = useRef(null);

  const handleKeyDown = (e, index) => {
    let newIndex = index;

    switch (e.key) {
      case "ArrowRight":
        newIndex = (index + 1) % tabs.length;
        break;
      case "ArrowLeft":
        newIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    setActiveIndex(newIndex);
    tabListRef.current?.children[newIndex]?.focus();
  };

  return (
    <div>
      <div role="tablist" ref={tabListRef} aria-label="Content tabs">
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            id={`tab-${index}`}
            aria-selected={index === activeIndex}
            aria-controls={`panel-${index}`}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={index !== activeIndex}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

### Menu Button

```tsx
function MenuButton({ label, items }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setActiveIndex(0);
        } else {
          setActiveIndex((prev) => Math.min(prev + 1, items.length - 1));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Escape":
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case "Enter":
      case " ":
        if (isOpen && activeIndex >= 0) {
          e.preventDefault();
          items[activeIndex].onClick();
          setIsOpen(false);
        }
        break;
    }
  };

  // Focus management
  useEffect(() => {
    if (isOpen && activeIndex >= 0) {
      menuRef.current?.children[activeIndex]?.focus();
    }
  }, [isOpen, activeIndex]);

  return (
    <div>
      <button
        ref={buttonRef}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
      >
        {label}
      </button>

      {isOpen && (
        <ul
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={handleKeyDown}
        >
          {items.map((item, index) => (
            <li
              key={index}
              role="menuitem"
              tabIndex={-1}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
                buttonRef.current?.focus();
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Combobox (Autocomplete)

```tsx
function Combobox({ options, onSelect, placeholder }) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const listboxId = useId();

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex((prev) =>
          Math.min(prev + 1, filteredOptions.length - 1),
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        if (activeIndex >= 0) {
          e.preventDefault();
          selectOption(filteredOptions[activeIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  const selectOption = (option) => {
    setInputValue(option);
    onSelect(option);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          activeIndex >= 0 ? `option-${activeIndex}` : undefined
        }
        aria-autocomplete="list"
        value={inputValue}
        placeholder={placeholder}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      />

      {isOpen && filteredOptions.length > 0 && (
        <ul id={listboxId} role="listbox">
          {filteredOptions.map((option, index) => (
            <li
              key={option}
              id={`option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => selectOption(option)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Alert Dialog

```tsx
function AlertDialog({ isOpen, onConfirm, onCancel, title, message }) {
  const confirmRef = useRef(null);
  const dialogId = useId();
  const titleId = `${dialogId}-title`;
  const descId = `${dialogId}-desc`;

  useEffect(() => {
    if (isOpen) {
      confirmRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <FocusTrap>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className="backdrop" onClick={onCancel} />

        <div className="dialog">
          <h2 id={titleId}>{title}</h2>
          <p id={descId}>{message}</p>

          <div className="actions">
            <button onClick={onCancel}>Cancel</button>
            <button ref={confirmRef} onClick={onConfirm}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
```

### Toolbar

```tsx
function Toolbar({ items }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const toolbarRef = useRef(null);

  const handleKeyDown = (e) => {
    let newIndex = activeIndex;

    switch (e.key) {
      case "ArrowRight":
        newIndex = (activeIndex + 1) % items.length;
        break;
      case "ArrowLeft":
        newIndex = (activeIndex - 1 + items.length) % items.length;
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    setActiveIndex(newIndex);
    toolbarRef.current?.querySelectorAll("button")[newIndex]?.focus();
  };

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Text formatting"
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => (
        <button
          key={index}
          tabIndex={index === activeIndex ? 0 : -1}
          aria-pressed={item.isActive}
          aria-label={item.label}
          onClick={item.onClick}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}
```

## Live Regions

### Polite Announcements

```tsx
// Status messages that don't interrupt
function SearchStatus({ count, query }) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      {count} results found for "{query}"
    </div>
  );
}

// Progress indicator
function LoadingStatus({ progress }) {
  return (
    <div role="status" aria-live="polite">
      Loading: {progress}% complete
    </div>
  );
}
```

### Assertive Announcements

```tsx
// Important errors that should interrupt
function ErrorAlert({ message }) {
  return (
    <div role="alert" aria-live="assertive">
      Error: {message}
    </div>
  );
}

// Form validation summary
function ValidationSummary({ errors }) {
  if (errors.length === 0) return null;

  return (
    <div role="alert" aria-live="assertive">
      <h2>Please fix the following errors:</h2>
      <ul>
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Log Region

```tsx
// Chat messages or activity log
function ChatLog({ messages }) {
  return (
    <div role="log" aria-live="polite" aria-relevant="additions">
      {messages.map((msg) => (
        <div key={msg.id}>
          <span className="author">{msg.author}:</span>
          <span className="text">{msg.text}</span>
        </div>
      ))}
    </div>
  );
}
```

## Common Mistakes to Avoid

### 1. Redundant ARIA

```tsx
// Bad: role="button" on a button
<button role="button">Click me</button>

// Good: just use button
<button>Click me</button>

// Bad: aria-label duplicating visible text
<button aria-label="Submit form">Submit form</button>

// Good: just use visible text
<button>Submit form</button>
```

### 2. Invalid ARIA

```tsx
// Bad: aria-selected on non-selectable element
<div aria-selected="true">Item</div>

// Good: use with proper role
<div role="option" aria-selected="true">Item</div>

// Bad: aria-expanded without control relationship
<button aria-expanded="true">Menu</button>
<div>Menu content</div>

// Good: with aria-controls
<button aria-expanded="true" aria-controls="menu">Menu</button>
<div id="menu">Menu content</div>
```

### 3. Hidden Content Still Announced

```tsx
// Bad: visually hidden but still in accessibility tree
<div style={{ display: 'none' }}>Hidden content</div>

// Good: properly hidden
<div style={{ display: 'none' }} aria-hidden="true">Hidden content</div>

// Or just use display: none (implicitly hidden)
<div hidden>Hidden content</div>
```

## Resources

- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [ARIA in HTML](https://www.w3.org/TR/html-aria/)
- [Using ARIA](https://www.w3.org/TR/using-aria/)
