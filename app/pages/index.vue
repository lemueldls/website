<script setup lang="ts">
useSeoMeta({
  title: "Lemuel De Los Santos",
  description: "Math & Computer Science Research Student",
});

defineOgImage("Root", {
  label: "index",
  title: "Home",
  description: "Personal website and portfolio.",
  meta: "full stack // systems // typography",
});

const { projects, socials, email, rings } = useAbout();

const currentProjects = computed(() => projects.value.filter(isActiveProject).slice(0, 2));

const { selected, randomWallpaper } = useWallpaper();

const discipline = [
  "Full Stack Development",
  // "Type Systems",
  // "Computer Graphics",
  // "Compilers",
  "Programming Languages",
  // "Systems Programming",
  // "Web Development",
  // "Cybersecurity",
  "Reverse Engineering",
  "Typography and Design",
];

const { data: posts } = await useAsyncData("home-writing", () =>
  queryCollection("blog").order("date", "DESC").all(),
);

const recentPosts = computed(() => (posts.value ?? []).filter((p) => !p.draft).slice(0, 3));

const slugOf = (post: { path: string }) => post.path.replace(/^\/blog\/?/, "");
</script>

<template>
  <div class="hero sheet-grid">
    <section class="hero__masthead" data-reveal-group>
      <h1 class="hero__title" data-nameplate>
        Lemuel <span class="hero__last-name">De Los Santos</span>
      </h1>

      <p class="hero__standfirst">Math & Computer Science Research Student</p>

      <div class="hero__rule" aria-hidden="true" />

      <div class="hero__meta" data-reveal-group>
        <div class="hero__col">
          <XLabel icon="material-symbols:person-outline-sharp">Pronouns</XLabel>
          <p class="hero__value">he/him</p>
          <span :style="{ height: '0.5em' }" />
          <XLabel icon="material-symbols:location-on-outline-sharp">Location</XLabel>
          <p class="hero__value">New York, NY</p>
        </div>

        <div class="hero__col">
          <XLabel icon="material-symbols:star-outline-sharp">Specializations</XLabel>
          <ul class="hero__disciplines">
            <li v-for="d in discipline" :key="d">{{ d }}</li>
          </ul>
        </div>

        <div class="hero__col">
          <XLabel icon="material-symbols:language-outline-sharp">Socials</XLabel>
          <ul class="hero__socials">
            <li v-for="social in socials" :key="social.title">
              <XLink class="hero__social-link" :href="social.href" external>
                <XIcon class="hero__social-icon" :name="social.icon" />
                {{ social.title }}
              </XLink>
            </li>
          </ul>
        </div>

        <!-- <div class="hero__col">
          <XLabel icon="material-symbols:language-outline-sharp">Webrings</XLabel>
          <div class="hero__rings">
            <span v-for="ring in rings" :key="ring.name" class="hero__ring">
              <XButton
                variant="ghost"
                size="sm"
                square
                :href="ring.prev"
                target="_self"
                :title="`Previous in ${ring.name}`"
              >
                <XIcon name="material-symbols:keyboard-double-arrow-left-outline-sharp" size="sm" />
              </XButton>
              <XLink :href="ring.home" target="_self">{{ ring.name }}</XLink>
              <XButton
                variant="ghost"
                size="sm"
                square
                :href="ring.next"
                target="_self"
                :title="`Next in ${ring.name}`"
              >
                <XIcon
                  name="material-symbols:keyboard-double-arrow-right-outline-sharp"
                  size="sm"
                />
              </XButton>
            </span>
          </div>
        </div> -->
      </div>
    </section>

    <XSection
      class="hero__current"
      label="Current work"
      icon="material-symbols:work-outline-sharp"
      :count="currentProjects.length"
      data-reveal-group
    >
      <ul class="hero__work">
        <li v-for="project in currentProjects" :key="project.slug" class="hero__work-item">
          <span class="hero__work-name">
            <XLink :to="`/projects/${project.slug}`">{{ project.name }}</XLink>
          </span>

          <p class="hero__work-desc">{{ project.description }}</p>

          <span class="hero__work-meta meta">
            <span class="hero__work-role">{{ project.role }}</span>
            <span class="hero__work-dot" aria-hidden="true">//</span>
            <span class="num">{{ formatProjectDates(project) }}</span>
          </span>

          <span class="hero__work-links">
            <XLink v-if="project.link" :href="project.link.href" external>{{
              project.link.text
            }}</XLink>
            <XLink v-if="project.github" :href="project.github.href" external>GitHub</XLink>
            <XLink v-if="project.tangled" :href="project.tangled.href" external>Tangled</XLink>
          </span>
        </li>
      </ul>

      <div class="hero__actions">
        <XButton to="/cv" variant="sheet"> Curriculum Vitae </XButton>
        <XButton to="/projects" variant="accent">
          All projects
          <XIcon name="material-symbols:arrow-forward-outline-sharp" />
        </XButton>
      </div>
    </XSection>

    <XSection
      class="hero__writing"
      label="Latest writing"
      icon="material-symbols:edit-note-outline-sharp"
      :count="recentPosts.length"
      data-reveal-group
    >
      <ul class="hero__writing-list">
        <li v-for="post in recentPosts" :key="post.path" class="hero__writing-item">
          <NuxtLink :to="`/writing/${slugOf(post)}`" class="hero__writing-link">
            <span class="hero__writing-title">{{ post.title }}</span>
            <span class="meta num">{{ post.date }}</span>
          </NuxtLink>
        </li>
      </ul>

      <div class="hero__writing-actions">
        <XButton to="/writing" variant="accent">
          All writing
          <XIcon name="material-symbols:arrow-forward-outline-sharp" />
        </XButton>
      </div>
    </XSection>
  </div>
</template>

<style scoped>
.hero {
  padding-inline: clamp(var(--space-4), 3vw, var(--space-8));
}

.hero__title {
  font-family: var(--f-display);
  font-size: var(--t-60);
  font-weight: var(--f-display-weight);
  line-height: 1;
  letter-spacing: -0.025em;
  margin-bottom: var(--space-6);
  text-wrap: balance;
}

.hero__last-name {
  color: var(--c-dim);
}

@media (max-width: 1024px) {
  .hero__last-name {
    display: block;
    font-size: var(--t-30);
  }
}

.hero__standfirst {
  font-family: var(--f-display);
  font-size: var(--t-18);
  line-height: 1.45;
  color: var(--c-dimmer);
  max-width: 50ch;
  text-wrap: pretty;
  font-style: italic;
}

.hero__intro {
  margin-top: var(--space-4);
  font-size: var(--t-11);
  line-height: 1.65;
  color: var(--c-fg);
  max-width: var(--measure-text);
  text-wrap: pretty;
}

.hero__rule {
  margin-block: var(--space-7) var(--space-8);
  border-top: 1px solid var(--c-rule-strong);
  position: relative;
  height: 3px;
}

.hero__rule::after,
.hero__rule::before {
  content: "";
  position: absolute;
  left: 0;
  width: 100%;
}

.hero__rule::before {
  top: 2px;
  border-top: 1px solid var(--c-rule);
}

.hero__rule::after {
  top: 5px;
  border-top: 1px solid var(--c-rule-faint);
}

.hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-7) var(--space-10);
}

.hero__col {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.hero__value {
  font-size: var(--t-10);
}

.hero__rings {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  /* gap: var(--space-1); */
  font-size: var(--t-10);
}

.hero__ring {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--t-10);
}

.hero__socials {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--t-10);
}

.hero__social-icon {
  display: inline-flex;
  margin-left: 0.25em;
  /* margin-right: 0.125em; */
  color: var(--c-dimmer);
  transition: color var(--dur-fast) var(--ease);
}

.hero__social-link:hover .hero__social-icon {
  color: var(--c-accent);
}

.hero__disciplines {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: var(--space-1) var(--space-6);
  font-size: var(--t-10);
}

.hero__disciplines li::before {
  content: "+ ";
  color: var(--c-accent);
  transition: color var(--dur) var(--ease);
}

.hero__work {
  list-style: none;
  padding: 0;
  margin-top: var(--space-4);
  display: flex;
  flex-direction: column;
}

.hero__work-item {
  display: grid;
  grid-template-columns: minmax(8rem, 1fr) auto;
  grid-template-areas:
    "name   links"
    "desc   desc"
    "meta   meta";
  align-items: baseline;
  gap: var(--space-1) var(--space-4);
  padding-block: var(--space-4);
  border-bottom: var(--rule-width) solid var(--c-rule);
}

.hero__work-name {
  grid-area: name;
  font-family: var(--f-display);
  font-size: var(--t-14);
  font-weight: 600;
}

.hero__work-meta {
  grid-area: meta;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5em;
}

.hero__work-role {
  /* letter-spacing: 0.06em; */
  text-transform: lowercase;
}

.hero__work-dot {
  color: var(--c-rule-strong);
}

.hero__work-desc {
  grid-area: desc;
  font-size: var(--t-10);
  line-height: 1.6;
  color: var(--c-dim);
  max-width: var(--measure-long);
  text-wrap: pretty;
}

.hero__work-links {
  grid-area: links;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-1) var(--space-4);
  font-size: var(--t-8);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-6);
}

.hero__writing-list {
  list-style: none;
  padding: 0;
  margin-top: var(--space-4);
  display: flex;
  flex-direction: column;
}

.hero__writing-item {
  border-bottom: var(--rule-width) solid var(--c-rule);
}

.hero__writing-link {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-1) var(--space-4);
  padding-block: var(--space-3);
  text-decoration: none;
  transition: color var(--dur-fast) var(--ease);
}

.hero__writing-link:hover {
  color: var(--c-accent);
}

.hero__writing-title {
  font-family: var(--f-display);
  font-size: var(--t-11);
  font-weight: 600;
  max-width: var(--measure-long);
}

.hero__writing-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-5);
}

.hero__wallpaper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
  padding-top: var(--space-6);
  border-top: var(--rule-width) solid var(--c-rule);
}

.hero__wallpaper-label {
  margin-bottom: var(--space-1);
}

.hero__wallpaper-line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-1) var(--space-2);
  font-size: var(--t-9);
  line-height: 1.6;
  color: var(--c-dim);
  max-width: var(--measure-text);
}

.hero__wallpaper-name {
  font-family: var(--f-label);
  font-size: var(--t-9);
  color: var(--c-fg);
}

.hero__wallpaper-name--none {
  color: var(--c-dimmer);
}

.hero__wallpaper-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-block: var(--space-1) var(--space-1);
}

@media (max-width: 640px) {
  .hero__wallpaper-tail {
    display: none;
  }
}
</style>
