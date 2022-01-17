import { g as globalApis } from './constants-de5287a6.js';
import { i as index } from './index-ba4e289c.js';
import 'url';
import './index-1964368a.js';
import 'path';
import './vi-8389a542.js';
import './index-59e12882.js';
import 'tty';
import 'local-pkg';
import './jest-mock-113430de.js';
import 'chai';
import 'tinyspy';
import './_commonjsHelpers-c9e3b764.js';

function registerApiGlobally() {
  globalApis.forEach((api) => {
    globalThis[api] = index[api];
  });
}

export { registerApiGlobally };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsLTFmYWFjMDU1LmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW50ZWdyYXRpb25zL2dsb2JhbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnbG9iYWxBcGlzIH0gZnJvbSAnLi4vY29uc3RhbnRzJ1xuaW1wb3J0ICogYXMgaW5kZXggZnJvbSAnLi4vaW5kZXgnXG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckFwaUdsb2JhbGx5KCkge1xuICBnbG9iYWxBcGlzLmZvckVhY2goKGFwaSkgPT4ge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgSSBrbm93IHdoYXQgSSBhbSBkb2luZyA6UFxuICAgIGdsb2JhbFRoaXNbYXBpXSA9IGluZGV4W2FwaV1cbiAgfSlcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUVPLFNBQVMsbUJBQW1CLEdBQUc7QUFDdEMsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxLQUFLO0FBQzlCLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqQyxHQUFHLENBQUMsQ0FBQztBQUNMOzsifQ==
