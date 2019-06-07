'use strict'; // necessary for es6 output in node

import { browser, element, by, ElementFinder, ElementArrayFinder } from 'protractor';
import { promise } from 'selenium-webdriver';

const expectedH1 = 'CRUD';
const expectedTitle = `${expectedH1}`;
const targetNote = { id: 15, name: 'Magneta' };
const targetNoteDashboardIndex = 3;
const nameSuffix = 'X';
const newNoteName = targetNote.name + nameSuffix;

class Note {
  id: number;
  name: string;

  // Factory methods

  // Note from string formatted as '<id> <name>'.
  static fromString(s: string): Note {
    return {
      id: +s.substr(0, s.indexOf(' ')),
      name: s.substr(s.indexOf(' ') + 1),
    };
  }

  // Note from note list <li> element.
  static async fromLi(li: ElementFinder): Promise<Note> {
      let stringsFromA = await li.all(by.css('a')).getText();
      let strings = stringsFromA[0].split(' ');
      return { id: +strings[0], name: strings[1] };
  }

  // Note id and name from the given detail element.
  static async fromDetail(detail: ElementFinder): Promise<Note> {
    // Get note id from the first <div>
    let _id = await detail.all(by.css('div')).first().getText();
    // Get name from the h2
    let _name = await detail.element(by.css('h2')).getText();
    return {
        id: +_id.substr(_id.indexOf(' ') + 1),
        name: _name.substr(0, _name.lastIndexOf(' '))
    };
  }
}

describe('Tutorial part 6', () => {

  beforeAll(() => browser.get(''));

  function getPageElts() {
    let navElts = element.all(by.css('app-root nav a'));

    return {
      navElts: navElts,

      appDashboardHref: navElts.get(0),
      appDashboard: element(by.css('app-root app-dashboard')),
      topNotes: element.all(by.css('app-root app-dashboard > div h4')),

      appNotesHref: navElts.get(1),
      appNotes: element(by.css('app-root app-notes')),
      allNotes: element.all(by.css('app-root app-notes li')),
      selectedNoteSubview: element(by.css('app-root app-notes > div:last-child')),

      noteDetail: element(by.css('app-root app-note-detail > div')),

      searchBox: element(by.css('#search-box')),
      searchResults: element.all(by.css('.search-result li'))
    };
  }

  describe('Initial page', () => {

    it(`has title '${expectedTitle}'`, () => {
      expect(browser.getTitle()).toEqual(expectedTitle);
    });

    it(`has h1 '${expectedH1}'`, () => {
        expectHeading(1, expectedH1);
    });

    const expectedViewNames = ['Dashboard', 'Notes'];
    it(`has views ${expectedViewNames}`, () => {
      let viewNames = getPageElts().navElts.map((el: ElementFinder) => el.getText());
      expect(viewNames).toEqual(expectedViewNames);
    });

    it('has dashboard as the active view', () => {
      let page = getPageElts();
      expect(page.appDashboard.isPresent()).toBeTruthy();
    });

  });

  describe('Dashboard tests', () => {

    beforeAll(() => browser.get(''));

    it('has top notes', () => {
      let page = getPageElts();
      expect(page.topNotes.count()).toEqual(4);
    });

    it(`selects and routes to ${targetNote.name} details`, dashboardSelectTargetNote);

    it(`updates note name (${newNoteName}) in details view`, updateNoteNameInDetailView);

    it(`cancels and shows ${targetNote.name} in Dashboard`, () => {
      element(by.buttonText('go back')).click();
      browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      let targetNoteElt = getPageElts().topNotes.get(targetNoteDashboardIndex);
      expect(targetNoteElt.getText()).toEqual(targetNote.name);
    });

    it(`selects and routes to ${targetNote.name} details`, dashboardSelectTargetNote);

    it(`updates note name (${newNoteName}) in details view`, updateNoteNameInDetailView);

    it(`saves and shows ${newNoteName} in Dashboard`, () => {
      element(by.buttonText('save')).click();
      browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      let targetNoteElt = getPageElts().topNotes.get(targetNoteDashboardIndex);
      expect(targetNoteElt.getText()).toEqual(newNoteName);
    });

  });

  describe('Notes tests', () => {

    beforeAll(() => browser.get(''));

    it('can switch to Notes view', () => {
      getPageElts().appNotesHref.click();
      let page = getPageElts();
      expect(page.appNotes.isPresent()).toBeTruthy();
      expect(page.allNotes.count()).toEqual(10, 'number of notes');
    });

    it('can route to note details', async () => {
      getNoteLiEltById(targetNote.id).click();

      let page = getPageElts();
      expect(page.noteDetail.isPresent()).toBeTruthy('shows note detail');
      let note = await Note.fromDetail(page.noteDetail);
      expect(note.id).toEqual(targetNote.id);
      expect(note.name).toEqual(targetNote.name.toUpperCase());
    });

    it(`updates note name (${newNoteName}) in details view`, updateNoteNameInDetailView);

    it(`shows ${newNoteName} in Notes list`, () => {
      element(by.buttonText('save')).click();
      browser.waitForAngular();
      let expectedText = `${targetNote.id} ${newNoteName}`;
      expect(getNoteAEltById(targetNote.id).getText()).toEqual(expectedText);
    });

    it(`deletes ${newNoteName} from Notes list`, async () => {
      const notesBefore = await toNoteArray(getPageElts().allNotes);
      const li = getNoteLiEltById(targetNote.id);
      li.element(by.buttonText('x')).click();

      const page = getPageElts();
      expect(page.appNotes.isPresent()).toBeTruthy();
      expect(page.allNotes.count()).toEqual(9, 'number of notes');
      const notesAfter = await toNoteArray(page.allNotes);
      // console.log(await Note.fromLi(page.allNotes[0]));
      const expectedNotes =  notesBefore.filter(h => h.name !== newNoteName);
      expect(notesAfter).toEqual(expectedNotes);
      // expect(page.selectedNoteSubview.isPresent()).toBeFalsy();
    });

    it(`adds back ${targetNote.name}`, async () => {
      const newNoteName = 'Alice';
      const notesBefore = await toNoteArray(getPageElts().allNotes);
      const numNotes = notesBefore.length;

      element(by.css('input')).sendKeys(newNoteName);
      element(by.buttonText('add')).click();

      let page = getPageElts();
      let notesAfter = await toNoteArray(page.allNotes);
      expect(notesAfter.length).toEqual(numNotes + 1, 'number of notes');

      expect(notesAfter.slice(0, numNotes)).toEqual(notesBefore, 'Old notes are still there');

      const maxId = notesBefore[notesBefore.length - 1].id;
      expect(notesAfter[numNotes]).toEqual({id: maxId + 1, name: newNoteName});
    });

    it('displays correctly styled buttons', async () => {
      element.all(by.buttonText('x')).then(buttons => {
        for (const button of buttons) {
          // Inherited styles from styles.css
          expect(button.getCssValue('font-family')).toBe('Arial');
          expect(button.getCssValue('border')).toContain('none');
          expect(button.getCssValue('padding')).toBe('5px 10px');
          expect(button.getCssValue('border-radius')).toBe('4px');
          // Styles defined in notes.component.css
          expect(button.getCssValue('left')).toBe('194px');
          expect(button.getCssValue('top')).toBe('-32px');
        }
      });

      const addButton = element(by.buttonText('add'));
      // Inherited styles from styles.css
      expect(addButton.getCssValue('font-family')).toBe('Arial');
      expect(addButton.getCssValue('border')).toContain('none');
      expect(addButton.getCssValue('padding')).toBe('5px 10px');
      expect(addButton.getCssValue('border-radius')).toBe('4px');
    });

  });

  describe('Progressive note search', () => {

    beforeAll(() => browser.get(''));

    it(`searches for 'Ma'`, async () => {
      getPageElts().searchBox.sendKeys('Ma');
      browser.sleep(1000);

      expect(getPageElts().searchResults.count()).toBe(4);
    });

    it(`continues search with 'g'`, async () => {
      getPageElts().searchBox.sendKeys('g');
      browser.sleep(1000);
      expect(getPageElts().searchResults.count()).toBe(2);
    });

    it(`continues search with 'e' and gets ${targetNote.name}`, async () => {
      getPageElts().searchBox.sendKeys('n');
      browser.sleep(1000);
      let page = getPageElts();
      expect(page.searchResults.count()).toBe(1);
      let note = page.searchResults.get(0);
      expect(note.getText()).toEqual(targetNote.name);
    });

    it(`navigates to ${targetNote.name} details view`, async () => {
      let note = getPageElts().searchResults.get(0);
      expect(note.getText()).toEqual(targetNote.name);
      note.click();

      let page = getPageElts();
      expect(page.noteDetail.isPresent()).toBeTruthy('shows note detail');
      let note2 = await Note.fromDetail(page.noteDetail);
      expect(note2.id).toEqual(targetNote.id);
      expect(note2.name).toEqual(targetNote.name.toUpperCase());
    });
  });

  async function dashboardSelectTargetNote() {
    let targetNoteElt = getPageElts().topNotes.get(targetNoteDashboardIndex);
    expect(targetNoteElt.getText()).toEqual(targetNote.name);
    targetNoteElt.click();
    browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

    let page = getPageElts();
    expect(page.noteDetail.isPresent()).toBeTruthy('shows note detail');
    let note = await Note.fromDetail(page.noteDetail);
    expect(note.id).toEqual(targetNote.id);
    expect(note.name).toEqual(targetNote.name.toUpperCase());
  }

  async function updateNoteNameInDetailView() {
    // Assumes that the current view is the note details view.
    addToNoteName(nameSuffix);

    let page = getPageElts();
    let note = await Note.fromDetail(page.noteDetail);
    expect(note.id).toEqual(targetNote.id);
    expect(note.name).toEqual(newNoteName.toUpperCase());
  }

});

function addToNoteName(text: string): promise.Promise<void> {
  let input = element(by.css('input'));
  return input.sendKeys(text);
}

function expectHeading(hLevel: number, expectedText: string): void {
    let hTag = `h${hLevel}`;
    let hText = element(by.css(hTag)).getText();
    expect(hText).toEqual(expectedText, hTag);
};

function getNoteAEltById(id: number): ElementFinder {
  let spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('..'));
}

function getNoteLiEltById(id: number): ElementFinder {
  let spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('../..'));
}

async function toNoteArray(allNotes: ElementArrayFinder): Promise<Note[]> {
  let promisedNotes = await allNotes.map(Note.fromLi);
  // The cast is necessary to get around issuing with the signature of Promise.all()
  return <Promise<any>> Promise.all(promisedNotes);
}
