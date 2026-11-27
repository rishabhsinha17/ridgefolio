"""Markup for the fictional community event permit workspace."""


def workspace():
    return """
<div id="permit-workspace" class="pd" aria-label="Community event permit desk" role="region">
  <div class="pd-mast">
    <div><p class="pd-id">Case RF-101</p><h3>Community event permit</h3></div>
    <p class="pd-status" id="desk-status" role="status" hidden></p>
  </div>
  <noscript><p>Use JavaScript to move the case through review, or <a href="/downloads/sample-permit-receipt.txt" download>download a completed sample receipt</a>.</p></noscript>
  <div class="pd-grid" id="pd-live" hidden>
    <section class="pd-panel" aria-labelledby="desk-heading">
      <div class="pd-section-head"><p id="pd-role" class="pd-role"></p><h3 id="desk-heading" tabindex="-1">Application intake</h3></div>
      <div id="desk-step">
        <p id="pd-instructions" class="pd-instructions"></p>
        <p id="pd-reviewer-note" class="pd-callout" hidden></p>
        <form id="pd-intake" novalidate hidden>
          <div class="pd-fields">
            <div class="pd-field pd-wide"><label for="pd-name">Event name</label><input id="pd-name" name="name" required maxlength="90" autocomplete="off"><span class="pd-error" id="pd-name-error" hidden></span></div>
            <div class="pd-field pd-wide"><label for="pd-venue">Event location</label><input id="pd-venue" name="venue" required maxlength="140" autocomplete="off"><span class="pd-error" id="pd-venue-error" hidden></span></div>
            <div class="pd-field"><label for="pd-date">Event date</label><input id="pd-date" name="date" type="date" required><span class="pd-error" id="pd-date-error" hidden></span></div>
            <div class="pd-field"><label for="pd-attendance">Expected attendance</label><input id="pd-attendance" name="attendance" type="number" inputmode="numeric" min="1" step="1" required><span class="pd-error" id="pd-attendance-error" hidden></span></div>
            <div class="pd-field pd-wide"><label for="pd-plan">Event plan <span>(optional)</span></label><textarea id="pd-plan" name="plan" rows="2" maxlength="600"></textarea></div>
          </div>
          <p id="desk-correction-error" class="pd-error pd-error-summary" role="alert" hidden>Update the application to address the reviewer’s note before resubmitting.</p>
          <div class="pd-actions"><button type="submit" id="pd-submit">Submit application</button></div>
        </form>

        <div id="pd-record" hidden>
          <p id="pd-record-title" class="pd-record-title"></p><dl id="pd-record-fields"></dl>
          <div id="pd-changes" class="pd-changes" hidden><h4>Changes since the last review</h4><dl id="pd-changed-fields"></dl></div>
        </div>
        <div id="pd-review" hidden>
          <button type="button" id="pd-approve">Approve permit</button>
          <form id="pd-return" novalidate>
            <label for="pd-note">Correction to request</label>
            <textarea id="pd-note" name="note" required maxlength="300" rows="2" placeholder="Describe what the applicant needs to change."></textarea>
            <span id="pd-note-error" class="pd-error" hidden></span>
            <button type="submit" class="pd-secondary">Request correction</button>
          </form>
        </div>
        <button type="button" id="pd-receipt" hidden>Download receipt</button>
      </div>
    </section>
    <aside class="pd-history" aria-labelledby="pd-history-heading">
      <div class="pd-history-head"><h3 id="pd-history-heading">Case history</h3><span id="pd-revision"></span></div>
      <ol id="desk-history" aria-label="Case history, newest first"></ol>
      <div class="pd-tools"><p id="pd-local">Saved in this tab.</p><button type="button" class="pd-secondary" id="desk-reset">Reset demo</button><button type="button" class="pd-secondary" id="pd-undo" hidden>Undo reset</button></div>
    </aside>
  </div>
</div>"""
