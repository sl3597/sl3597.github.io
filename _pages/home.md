---
layout: terminal
title: "Home"
permalink: /
excerpt: "Shengwei Liu — Applied Physical AI Researcher at Siemens; M.Eng. ECE, Cornell Tech; B.Eng. EEE, UCL. Working on Physical AI, multimodal foundation models, and efficient model inference and deployment."
---

{% include base_path %}
<div class="tty" id="tty" data-email="{{ site.author.email }}" data-linkedin="{{ site.author.linkedin }}" data-cv="{{ base_path }}/files/Shengwei_Liu_Resume.pdf">
  <div class="tty__screen" id="tty-screen">
    <div class="tty__out" id="tty-out" aria-live="polite">
      <div class="tty__line tty__line--cmd" data-boot="type"><span class="tty__prompt">~ $</span> whoami</div>
      <div class="tty__line tty__line--name" data-boot="id">Shengwei Liu</div>
      <div class="tty__line" data-boot="id">Applied Physical AI Researcher <span class="tty__dim">@</span> Siemens</div>
      <div class="tty__line" data-boot="id">M.Eng ECE <span class="tty__dim">@</span> Cornell Tech <span class="tty__dim">&middot;</span> B.Eng EEE <span class="tty__dim">@</span> UCL</div>
      <div class="tty__line tty__line--soft tty__line--li" data-boot="id"><span class="tty__dim">&bull;</span> Physical AI: VLA, WAM &amp; robot learning for industrial automation</div>
      <div class="tty__line tty__line--soft tty__line--li" data-boot="id"><span class="tty__dim">&bull;</span> multimodal foundation models: LLM, VLM, diffusion</div>
      <div class="tty__line tty__line--soft tty__line--li" data-boot="id"><span class="tty__dim">&bull;</span> efficient inference: low-bit quantization, Triton kernels, compilation</div>
      <div class="tty__line tty__line--soft tty__line--li" data-boot="id"><span class="tty__dim">&bull;</span> hardware&ndash;software co-design: CXL memory systems, RTL-to-GDSII</div>
      <div class="tty__line tty__line--cmd" data-boot="type"><span class="tty__prompt">~ $</span> help</div>
      <div class="tty__help" id="tty-help" data-boot="help">
        <a class="tty__row" href="{{ base_path }}/about/" data-cmd="about"><span class="tty__k">about</span><span class="tty__d">who I am and what I work on</span></a>
        <a class="tty__row" href="{{ base_path }}/publications/" data-cmd="publications"><span class="tty__k">publications</span><span class="tty__d">papers</span></a>
        <a class="tty__row" href="{{ base_path }}/files/Shengwei_Liu_Resume.pdf" target="_blank" rel="noopener" data-cmd="cv"><span class="tty__k">cv</span><span class="tty__d">r&eacute;sum&eacute;, PDF</span></a>
        <a class="tty__row" href="{{ base_path }}/wanderlust/" data-cmd="wanderlust"><span class="tty__k">wanderlust</span><span class="tty__d">places I&rsquo;ve been, on a 3D globe</span></a>
        <button class="tty__row" type="button" data-cmd="fly "><span class="tty__k">fly &lt;city&gt;</span><span class="tty__d">e.g. <em>fly zermatt</em></span></button>
        <a class="tty__row" href="mailto:{{ site.author.email }}" data-cmd="email"><span class="tty__k">email</span><span class="tty__d">{{ site.author.email }}</span></a>
        <a class="tty__row" href="https://www.linkedin.com/in/{{ site.author.linkedin }}" target="_blank" rel="noopener" data-cmd="linkedin"><span class="tty__k">linkedin</span><span class="tty__d">linkedin.com/in/{{ site.author.linkedin }}</span></a>
        <button class="tty__row" type="button" data-cmd="theme"><span class="tty__k">theme</span><span class="tty__d">toggle light / dark</span></button>
      </div>
    </div>
    <form class="tty__prompt-line" id="tty-form" data-boot="form" autocomplete="off">
      <label for="tty-input" class="tty__prompt">~ $</label> <span class="tty__echo" id="tty-echo" aria-hidden="true"></span><span class="tty__cursor" aria-hidden="true"></span><span class="tty__ghost" id="tty-ghost" aria-hidden="true"></span><input id="tty-input" class="tty__input" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Type a command, for example help" enterkeyhint="go">
    </form>
    <div class="tty__suggest" id="tty-suggest" hidden></div>
  </div>
</div>
<script>(function(){var t=document.getElementById("tty");if(t){t.classList.add("is-booting");setTimeout(function(){if(!window.__ttyReady)t.classList.remove("is-booting");},5000);}})();</script>
<p class="tty__hint"><span class="tty__hint--keys"><kbd>Tab</kbd> complete <span class="tty__dim">&middot;</span> <kbd>&uarr;</kbd><kbd>&darr;</kbd> history <span class="tty__dim">&middot;</span> <kbd data-modkey>&#8984;</kbd><kbd>K</kbd> palette from any page</span><span class="tty__hint--touch">Tap a command above, or type one.</span></p>
<script src="{{ base_path }}/assets/js/home-terminal.js" defer></script>
