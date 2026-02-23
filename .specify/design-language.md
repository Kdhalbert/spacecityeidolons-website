# Space City Eidolons — Design Language

## Palette

| Token | Value | Use |
|-------|-------|-----|
| `--primary-purple` | `#321D3C` | Card backgrounds, button gradients |
| `--purple-lighter` | `#4a2d5c` | Card borders, hover states, dividers |
| `--gold` | `#D8C362` | All headings, CTA buttons, hover highlights |
| `--gold-glow` | `rgba(216, 195, 98, 0.4)` | Drop shadows, focus rings, glows |
| `--bg-dark` | `#0d1b2a` | Page background (outer radial) |
| `--bg-secondary` | `#1b263b` | Page background (inner radial), section tints |
| `--text-light` | `#e8e4f0` | Body copy, paragraph text |
| `--text-muted` | `#9d95b0` | Subtitles, placeholder text, labels |

All values are defined as CSS custom properties in `src/App.css` and can be referenced anywhere
via `var(--token-name)`.

---

## Typography

| Context | Font | Notes |
|---------|------|-------|
| All headings (h1–h3), nav, buttons | **Cinzel** (serif) | Loaded from Google Fonts in `index.html` |
| Body copy, paragraphs, form text | System sans-serif | `font-family: sans-serif` |

**Heading colours are automatic inside the right containers.** The global `h1` rule in
`App.css` is gold. `h2`/`h3` inside `.dark-card` are gold. Everywhere else set colour
explicitly with `style={{ color: 'var(--gold)' }}`.

---

## Layout Primitives — `src/components/ui/`

Import from `../components/ui` (or `../../components/ui` depending on depth).

### `<PageHero>`

Top-of-page hero with gold h1, optional floating logo, tagline, and description.

```tsx
import { PageHero } from '../components/ui';

<PageHero
  title="Games"
  subtitle="A Gaming Community"        // optional muted line below title
  description="Browse games we play."  // optional body paragraph
  showLogo={false}                      // set true on the home page only
/>
```

### `<PageSection>`

Content section with centred `max-width: 1100px` container and `48px` vertical padding.

```tsx
import { PageSection } from '../components/ui';

// Standard section (transparent, dark cards sit inside)
<PageSection>
  <SectionTitle>Who We Are</SectionTitle>
  <DarkCard>...</DarkCard>
</PageSection>

// Highlighted section (semi-transparent navy tint — use for "join/CTA" sections)
<PageSection dark id="join-section">
  ...
</PageSection>
```

### `<DarkCard>`

Deep purple card with gold borders — the primary container for content blocks.

```tsx
import { DarkCard } from '../components/ui';

<DarkCard>
  <h2>Section Heading</h2>          {/* automatically gold */}
  <p>Body text automatically light.</p>
  <ul>
    <li><span className="gold-bullet">✦</span> List item</li>
  </ul>
</DarkCard>

// Grid of cards
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
  <DarkCard>...</DarkCard>
  <DarkCard>...</DarkCard>
  <DarkCard>...</DarkCard>
</div>
```

### `<SectionTitle>`

Gold centred h2 with optional muted subtitle. Place before card grids or feature lists.

```tsx
import { SectionTitle } from '../components/ui';

<SectionTitle subtitle="Connect on Discord or Matrix">
  Join Our Community
</SectionTitle>
```

---

## Form Components — `src/components/`

`<Button>` and `<Input>` are already dark-themed. Use them directly without wrapping.

### `<Button>`

```tsx
import { Button } from '../components';

<Button variant="primary">Request Invite</Button> // gold gradient, gold border
<Button variant="secondary">Cancel</Button>       // transparent, gold hover
<Button variant="danger">Delete</Button>          // dark red
<Button variant="ghost">Dismiss</Button>          // muted text, no border

<Button size="sm" />   // 6px 14px padding, 0.8rem text
<Button size="md" />   // default
<Button size="lg" />   // 14px 32px padding, 1rem text

<Button fullWidth />   // width: 100%
<Button isLoading />   // spinner + "Loading..." text, disabled
```

### `<Input>`

```tsx
import { Input } from '../components';

<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  error={errors.email?.message}
  helpText="We'll never share your email."
  required
/>
```

Dark input (navy background, purple-lighter border, gold focus ring) is applied automatically.
Labels use Cinzel at 0.8rem. Error text is `#ff9999`. Help text is `--text-muted`.

---

## CSS Classes Quick Reference

From `src/App.css` — for cases where you need raw classes rather than components:

| Class | Purpose |
|-------|---------|
| `.app` | Root wrapper: dark radial gradient, Cinzel font, flex column |
| `.site-header` | Dark purple header with backdrop-filter blur |
| `.site-footer` | Dark navy footer |
| `.hero-section` | Centred hero: padded, `text-align: center` |
| `.content-section` | Max-width 1100px centred container, 48px padding |
| `.dark-card` | Purple card, gold h2/h3, light p/li |
| `.section-title` | Gold centred h2 with text-shadow glow |
| `.section-subtitle` | Muted centred paragraph below section-title |
| `.join-section` | Navy-tinted section for CTAs |
| `.invite-card-wrapper` | Purple card wrapper for forms inside join-section |
| `.gold-bullet` | Gold `✦` for list items inside dark-card |
| `.chat-link` | Gold pill link/button (for `<a>` and `<Link>` tags) |
| `.tagline` | Muted subtitle below h1 in hero |
| `.hero-desc` | Sans-serif body paragraph in hero |
| `.logo` | Floating logo with gold glow drop-shadow animation |
| `.btn` `.btn-primary` `.btn-{variant}` `.btn-{size}` | Use `<Button>` instead |
| `.input-dark` `.input-dark-label` | Use `<Input>` instead |

---

## Rules for New Pages

1. **Start with `<PageHero>`** — every page gets a gold title and optional tagline.
2. **Wrap content in `<PageSection>`** — never use raw `max-w-*` Tailwind for page layout.
3. **Use `<DarkCard>`** instead of any white/gray card.
4. **Use `<SectionTitle>`** before any grid of cards or a major content block.
5. **Never use Tailwind color classes** (`text-gray-*`, `bg-white`, `bg-blue-*`, etc.) — use
   CSS variables or the components above instead.
6. **`<Button>` and `<Input>`** are already themed — use them as-is.
7. **For `<Link>` elements styled as buttons**, use `className="chat-link"` or wrap in
   a `<Button>` rendered as a link (future enhancement).

---

## Page Template

```tsx
import React from 'react';
import { PageHero, PageSection, SectionTitle, DarkCard } from '../components/ui';

const MyPage: React.FC = () => (
  <>
    <PageHero
      title="Page Title"
      subtitle="Short tagline"
      description="One or two sentences of context."
    />

    <PageSection>
      <SectionTitle subtitle="Optional subtitle">Section Heading</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <DarkCard>
          <h3>Card Title</h3>
          <p>Card body text.</p>
        </DarkCard>
      </div>
    </PageSection>

    <PageSection dark id="cta-section">
      <SectionTitle subtitle="How to get involved">Take Action</SectionTitle>
      {/* CTA content, forms, etc. */}
    </PageSection>
  </>
);

export default MyPage;
```
