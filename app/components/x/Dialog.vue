<script setup lang="ts">
const open = defineModel<boolean>("open", { required: true });

const props = withDefaults(
  defineProps<{
    title?: string;

    size?: "md" | "wide";
  }>(),
  { size: "md" },
);

const { title, size } = toRefs(props);

function onOpenChange(next: boolean) {
  open.value = next;
}
</script>

<template>
  <DialogRoot :open="open" @update:open="onOpenChange">
    <DialogPortal>
      <DialogOverlay class="dialog__overlay" />
      <DialogContent
        class="dialog__content"
        :class="size === 'wide' ? 'dialog__content--wide' : 'dialog__content--md'"
      >
        <span class="mark mark--tl" />
        <span class="mark mark--tr" />
        <span class="mark mark--bl" />
        <span class="mark mark--br" />

        <header class="dialog__head">
          <DialogTitle v-if="title" class="dialog__title">{{ title }}</DialogTitle>
          <slot name="header" />
          <DialogClose class="dialog__close" aria-label="Close">
            <XIcon name="material-symbols:close-sharp" size="md" />
          </DialogClose>
        </header>

        <div class="dialog__body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="dialog__foot">
          <slot name="footer" />
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.dialog__overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-dialog);
  background: color-mix(in srgb, var(--c-bg) 82%, transparent);
  backdrop-filter: blur(3px) saturate(0.7);
}

.dialog__content {
  position: fixed;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  z-index: calc(var(--z-dialog) + 1);
  background: var(--c-sheet);
  border: var(--rule-width) solid var(--c-rule-strong);
  box-shadow: 0 var(--space-4) var(--space-9) color-mix(in srgb, var(--c-bg) 60%, transparent);
  display: flex;
  flex-direction: column;
  max-height: min(92dvh, 60rem);
  overflow: hidden;
}

.dialog__content--md {
  width: min(92vw, 40rem);
}

.dialog__content--wide {
  width: min(92vw, 72rem);
}

@media (max-width: 640px) {
  .dialog__content {
    inset: 0;
    translate: 0;
    max-height: none;
    width: 100%;
    height: 100%;
    border: none;
  }
}

.dialog__head {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-bottom: var(--rule-width) solid var(--c-rule);
  flex-shrink: 0;
}

.dialog__title {
  font-family: var(--f-label);
  font-size: var(--t-8);
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: lowercase;
  color: var(--c-accent);
  transition: color var(--dur) var(--ease);
}

.dialog__close {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;

  padding: 0;
  border: var(--rule-width) solid transparent;
  background: transparent;
  color: var(--c-dim);
  cursor: pointer;
  transition:
    border-color var(--dur-fast) var(--ease),
    color var(--dur-fast) var(--ease);
}

.dialog__close:hover {
  border-color: var(--c-rule);
  color: var(--c-fg);
}

.dialog__body {
  overflow: auto;
  flex: 1;
  min-height: 0;
}

.dialog__foot {
  padding: var(--space-3) var(--space-4);
  border-top: var(--rule-width) solid var(--c-rule);
  flex-shrink: 0;
}
</style>
