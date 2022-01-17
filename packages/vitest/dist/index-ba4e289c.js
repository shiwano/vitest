import { g as getCurrentSuite, w as withTimeout, a as getDefaultHookTimeout, b as getState, s as setState, c as suite, t as test, d as describe, i as it, v as vitest, e as vi } from './vi-8389a542.js';
import chai, { assert, should } from 'chai';
import { s as spies, i as isMockFunction, a as spyOn, f as fn } from './jest-mock-113430de.js';

const beforeAll = (fn, timeout) => getCurrentSuite().on("beforeAll", withTimeout(fn, timeout ?? getDefaultHookTimeout()));
const afterAll = (fn, timeout) => getCurrentSuite().on("afterAll", withTimeout(fn, timeout ?? getDefaultHookTimeout()));
const beforeEach = (fn, timeout) => getCurrentSuite().on("beforeEach", withTimeout(fn, timeout ?? getDefaultHookTimeout()));
const afterEach = (fn, timeout) => getCurrentSuite().on("afterEach", withTimeout(fn, timeout ?? getDefaultHookTimeout()));

const expect = (value, message) => {
  const { assertionCalls } = getState();
  setState({ assertionCalls: assertionCalls + 1 });
  return chai.expect(value, message);
};
expect.getState = getState;
expect.setState = setState;
Object.assign(expect, chai.expect);

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  suite: suite,
  test: test,
  describe: describe,
  it: it,
  beforeAll: beforeAll,
  afterAll: afterAll,
  beforeEach: beforeEach,
  afterEach: afterEach,
  assert: assert,
  should: should,
  chai: chai,
  expect: expect,
  spies: spies,
  isMockFunction: isMockFunction,
  spyOn: spyOn,
  fn: fn,
  vitest: vitest,
  vi: vi
});

export { afterAll as a, beforeAll as b, beforeEach as c, afterEach as d, expect as e, index as i };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgtYmE0ZTI4OWMuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9ydW50aW1lL2hvb2tzLnRzIiwiLi4vc3JjL2ludGVncmF0aW9ucy9jaGFpL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgU3VpdGVIb29rcyB9IGZyb20gJy4uL3R5cGVzJ1xuaW1wb3J0IHsgZ2V0RGVmYXVsdEhvb2tUaW1lb3V0LCB3aXRoVGltZW91dCB9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7IGdldEN1cnJlbnRTdWl0ZSB9IGZyb20gJy4vc3VpdGUnXG5cbi8vIHN1aXRlIGhvb2tzXG5leHBvcnQgY29uc3QgYmVmb3JlQWxsID0gKGZuOiBTdWl0ZUhvb2tzWydiZWZvcmVBbGwnXVswXSwgdGltZW91dD86IG51bWJlcikgPT4gZ2V0Q3VycmVudFN1aXRlKCkub24oJ2JlZm9yZUFsbCcsIHdpdGhUaW1lb3V0KGZuLCB0aW1lb3V0ID8/IGdldERlZmF1bHRIb29rVGltZW91dCgpKSlcbmV4cG9ydCBjb25zdCBhZnRlckFsbCA9IChmbjogU3VpdGVIb29rc1snYWZ0ZXJBbGwnXVswXSwgdGltZW91dD86IG51bWJlcikgPT4gZ2V0Q3VycmVudFN1aXRlKCkub24oJ2FmdGVyQWxsJywgd2l0aFRpbWVvdXQoZm4sIHRpbWVvdXQgPz8gZ2V0RGVmYXVsdEhvb2tUaW1lb3V0KCkpKVxuZXhwb3J0IGNvbnN0IGJlZm9yZUVhY2ggPSAoZm46IFN1aXRlSG9va3NbJ2JlZm9yZUVhY2gnXVswXSwgdGltZW91dD86IG51bWJlcikgPT4gZ2V0Q3VycmVudFN1aXRlKCkub24oJ2JlZm9yZUVhY2gnLCB3aXRoVGltZW91dChmbiwgdGltZW91dCA/PyBnZXREZWZhdWx0SG9va1RpbWVvdXQoKSkpXG5leHBvcnQgY29uc3QgYWZ0ZXJFYWNoID0gKGZuOiBTdWl0ZUhvb2tzWydhZnRlckVhY2gnXVswXSwgdGltZW91dD86IG51bWJlcikgPT4gZ2V0Q3VycmVudFN1aXRlKCkub24oJ2FmdGVyRWFjaCcsIHdpdGhUaW1lb3V0KGZuLCB0aW1lb3V0ID8/IGdldERlZmF1bHRIb29rVGltZW91dCgpKSlcbiIsImltcG9ydCBjaGFpIGZyb20gJ2NoYWknXG5pbXBvcnQgeyBnZXRTdGF0ZSwgc2V0U3RhdGUgfSBmcm9tICcuL2plc3QtZXhwZWN0J1xuXG5leHBvcnQgeyBhc3NlcnQsIHNob3VsZCB9IGZyb20gJ2NoYWknXG5cbmNvbnN0IGV4cGVjdCA9ICgodmFsdWU6IGFueSwgbWVzc2FnZT86IHN0cmluZyk6IENoYWkuVml0ZXN0QXNzZXJ0aW9uID0+IHtcbiAgY29uc3QgeyBhc3NlcnRpb25DYWxscyB9ID0gZ2V0U3RhdGUoKVxuICBzZXRTdGF0ZSh7IGFzc2VydGlvbkNhbGxzOiBhc3NlcnRpb25DYWxscyArIDEgfSlcbiAgcmV0dXJuIGNoYWkuZXhwZWN0KHZhbHVlLCBtZXNzYWdlKVxufSkgYXMgQ2hhaS5FeHBlY3RTdGF0aWNcbmV4cGVjdC5nZXRTdGF0ZSA9IGdldFN0YXRlXG5leHBlY3Quc2V0U3RhdGUgPSBzZXRTdGF0ZVxuXG5PYmplY3QuYXNzaWduKGV4cGVjdCwgY2hhaS5leHBlY3QpXG5cbmV4cG9ydCB7IGNoYWksIGV4cGVjdCB9XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUVZLE1BQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxFQUFFLE9BQU8sS0FBSyxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxFQUFFLEVBQUUsT0FBTyxJQUFJLHFCQUFxQixFQUFFLENBQUMsRUFBRTtBQUNySCxNQUFDLFFBQVEsR0FBRyxDQUFDLEVBQUUsRUFBRSxPQUFPLEtBQUssZUFBZSxFQUFFLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsRUFBRSxFQUFFLE9BQU8sSUFBSSxxQkFBcUIsRUFBRSxDQUFDLEVBQUU7QUFDbkgsTUFBQyxVQUFVLEdBQUcsQ0FBQyxFQUFFLEVBQUUsT0FBTyxLQUFLLGVBQWUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUkscUJBQXFCLEVBQUUsQ0FBQyxFQUFFO0FBQ3ZILE1BQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxFQUFFLE9BQU8sS0FBSyxlQUFlLEVBQUUsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxFQUFFLEVBQUUsT0FBTyxJQUFJLHFCQUFxQixFQUFFLENBQUM7O0FDRjFILE1BQUMsTUFBTSxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sS0FBSztBQUNuQyxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxRQUFRLEVBQUUsQ0FBQztBQUN4QyxFQUFFLFFBQVEsQ0FBQyxFQUFFLGNBQWMsRUFBRSxjQUFjLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNuRCxFQUFFLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDckMsRUFBRTtBQUNGLE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQzNCLE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQzNCLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsifQ==
