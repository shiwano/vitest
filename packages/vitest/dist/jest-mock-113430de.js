import { util } from 'chai';
import * as tinyspy from 'tinyspy';

const spies = new Set();
function isMockFunction(fn2) {
  return typeof fn2 === "function" && "__isSpy" in fn2 && fn2.__isSpy;
}
function spyOn(obj, method, accessType) {
  const dictionary = {
    get: "getter",
    set: "setter"
  };
  const objMethod = accessType ? { [dictionary[accessType]]: method } : method;
  const stub = tinyspy.spyOn(obj, objMethod);
  return enhanceSpy(stub);
}
let callOrder = 0;
function enhanceSpy(spy) {
  const stub = spy;
  let implementation;
  let instances = [];
  let invocations = [];
  const mockContext = {
    get calls() {
      return stub.calls;
    },
    get instances() {
      return instances;
    },
    get invocationCallOrder() {
      return invocations;
    },
    get results() {
      return stub.results.map(([callType, value]) => {
        const type = callType === "error" ? "throw" : "return";
        return { type, value };
      });
    }
  };
  let onceImplementations = [];
  let name = stub.name;
  stub.getMockName = () => name || "vi.fn()";
  stub.mockName = (n) => {
    name = n;
    return stub;
  };
  stub.mockClear = () => {
    stub.reset();
    instances = [];
    invocations = [];
    return stub;
  };
  stub.mockReset = () => {
    stub.mockClear();
    implementation = () => void 0;
    onceImplementations = [];
    return stub;
  };
  stub.mockRestore = () => {
    stub.mockReset();
    implementation = void 0;
    return stub;
  };
  stub.getMockImplementation = () => implementation;
  stub.mockImplementation = (fn2) => {
    implementation = fn2;
    return stub;
  };
  stub.mockImplementationOnce = (fn2) => {
    onceImplementations.push(fn2);
    return stub;
  };
  stub.mockReturnThis = () => stub.mockImplementation(function() {
    return this;
  });
  stub.mockReturnValue = (val) => stub.mockImplementation(() => val);
  stub.mockReturnValueOnce = (val) => stub.mockImplementationOnce(() => val);
  stub.mockResolvedValue = (val) => stub.mockImplementation(() => Promise.resolve(val));
  stub.mockResolvedValueOnce = (val) => stub.mockImplementationOnce(() => Promise.resolve(val));
  stub.mockRejectedValue = (val) => stub.mockImplementation(() => Promise.reject(val));
  stub.mockRejectedValueOnce = (val) => stub.mockImplementationOnce(() => Promise.reject(val));
  util.addProperty(stub, "mock", () => mockContext);
  stub.willCall(function(...args) {
    instances.push(this);
    invocations.push(++callOrder);
    const impl = onceImplementations.shift() || implementation || stub.getOriginal() || (() => {
    });
    return impl.apply(this, args);
  });
  spies.add(stub);
  return stub;
}
function fn(implementation) {
  return enhanceSpy(tinyspy.spyOn({ fn: implementation || (() => {
  }) }, "fn"));
}

export { spyOn as a, fn as f, isMockFunction as i, spies as s };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamVzdC1tb2NrLTExMzQzMGRlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvaW50ZWdyYXRpb25zL2plc3QtbW9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1dGlsIH0gZnJvbSAnY2hhaSdcbmltcG9ydCB0eXBlIHsgU3B5SW1wbCB9IGZyb20gJ3RpbnlzcHknXG5pbXBvcnQgKiBhcyB0aW55c3B5IGZyb20gJ3RpbnlzcHknXG5cbmludGVyZmFjZSBNb2NrUmVzdWx0UmV0dXJuPFQ+IHtcbiAgdHlwZTogJ3JldHVybidcbiAgdmFsdWU6IFRcbn1cbmludGVyZmFjZSBNb2NrUmVzdWx0SW5jb21wbGV0ZSB7XG4gIHR5cGU6ICdpbmNvbXBsZXRlJ1xuICB2YWx1ZTogdW5kZWZpbmVkXG59XG5pbnRlcmZhY2UgTW9ja1Jlc3VsdFRocm93IHtcbiAgdHlwZTogJ3Rocm93J1xuICB2YWx1ZTogYW55XG59XG5cbnR5cGUgTW9ja1Jlc3VsdDxUPiA9IE1vY2tSZXN1bHRSZXR1cm48VD4gfCBNb2NrUmVzdWx0VGhyb3cgfCBNb2NrUmVzdWx0SW5jb21wbGV0ZVxuXG5leHBvcnQgaW50ZXJmYWNlIEplc3RNb2NrQ29tcGF0Q29udGV4dDxUQXJncywgVFJldHVybnM+IHtcbiAgY2FsbHM6IFRBcmdzW11cbiAgaW5zdGFuY2VzOiBUUmV0dXJuc1tdXG4gIGludm9jYXRpb25DYWxsT3JkZXI6IG51bWJlcltdXG4gIHJlc3VsdHM6IE1vY2tSZXN1bHQ8VFJldHVybnM+W11cbn1cblxudHlwZSBQcm9jZWR1cmUgPSAoLi4uYXJnczogYW55W10pID0+IGFueVxuXG50eXBlIE1ldGhvZHM8VD4gPSB7XG4gIFtLIGluIGtleW9mIFRdOiBUW0tdIGV4dGVuZHMgUHJvY2VkdXJlID8gSyA6IG5ldmVyXG59W2tleW9mIFRdICYgc3RyaW5nXG50eXBlIFByb3BlcnRpZXM8VD4gPSB7XG4gIFtLIGluIGtleW9mIFRdOiBUW0tdIGV4dGVuZHMgUHJvY2VkdXJlID8gbmV2ZXIgOiBLXG59W2tleW9mIFRdICYgc3RyaW5nXG50eXBlIENsYXNzZXM8VD4gPSB7XG4gIFtLIGluIGtleW9mIFRdOiBUW0tdIGV4dGVuZHMgbmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55ID8gSyA6IG5ldmVyXG59W2tleW9mIFRdICYgc3RyaW5nXG5cbmV4cG9ydCBpbnRlcmZhY2UgSmVzdE1vY2tDb21wYXQ8VEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IGFueVtdLCBUUmV0dXJucyA9IGFueT4ge1xuICBnZXRNb2NrTmFtZSgpOiBzdHJpbmdcbiAgbW9ja05hbWUobjogc3RyaW5nKTogdGhpc1xuICBtb2NrOiBKZXN0TW9ja0NvbXBhdENvbnRleHQ8VEFyZ3MsIFRSZXR1cm5zPlxuICBtb2NrQ2xlYXIoKTogdGhpc1xuICBtb2NrUmVzZXQoKTogdGhpc1xuICBtb2NrUmVzdG9yZSgpOiB2b2lkXG4gIGdldE1vY2tJbXBsZW1lbnRhdGlvbigpOiAoKC4uLmFyZ3M6IFRBcmdzKSA9PiBUUmV0dXJucykgfCB1bmRlZmluZWRcbiAgbW9ja0ltcGxlbWVudGF0aW9uKGZuOiAoKC4uLmFyZ3M6IFRBcmdzKSA9PiBUUmV0dXJucykgfCAoKCkgPT4gUHJvbWlzZTxUUmV0dXJucz4pKTogdGhpc1xuICBtb2NrSW1wbGVtZW50YXRpb25PbmNlKGZuOiAoKC4uLmFyZ3M6IFRBcmdzKSA9PiBUUmV0dXJucykgfCAoKCkgPT4gUHJvbWlzZTxUUmV0dXJucz4pKTogdGhpc1xuICBtb2NrUmV0dXJuVGhpcygpOiB0aGlzXG4gIG1vY2tSZXR1cm5WYWx1ZShvYmo6IFRSZXR1cm5zKTogdGhpc1xuICBtb2NrUmV0dXJuVmFsdWVPbmNlKG9iajogVFJldHVybnMpOiB0aGlzXG4gIG1vY2tSZXNvbHZlZFZhbHVlKG9iajogQXdhaXRlZDxUUmV0dXJucz4pOiB0aGlzXG4gIG1vY2tSZXNvbHZlZFZhbHVlT25jZShvYmo6IEF3YWl0ZWQ8VFJldHVybnM+KTogdGhpc1xuICBtb2NrUmVqZWN0ZWRWYWx1ZShvYmo6IGFueSk6IHRoaXNcbiAgbW9ja1JlamVjdGVkVmFsdWVPbmNlKG9iajogYW55KTogdGhpc1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEplc3RNb2NrQ29tcGF0Rm48VEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IGFueSwgVFJldHVybnMgPSBhbnk+IGV4dGVuZHMgSmVzdE1vY2tDb21wYXQ8VEFyZ3MsIFRSZXR1cm5zPiB7XG4gICguLi5hcmdzOiBUQXJncyk6IFRSZXR1cm5zXG59XG5cbmV4cG9ydCB0eXBlIE1heWJlTW9ja2VkQ29uc3RydWN0b3I8VD4gPSBUIGV4dGVuZHMgbmV3IChcbiAgLi4uYXJnczogQXJyYXk8YW55PlxuKSA9PiBpbmZlciBSXG4gID8gSmVzdE1vY2tDb21wYXRGbjxDb25zdHJ1Y3RvclBhcmFtZXRlcnM8VD4sIFI+XG4gIDogVFxuZXhwb3J0IHR5cGUgTW9ja2VkRnVuY3Rpb248VCBleHRlbmRzIFByb2NlZHVyZT4gPSBNb2NrV2l0aEFyZ3M8VD4gJiB7XG4gIFtLIGluIGtleW9mIFRdOiBUW0tdO1xufVxuZXhwb3J0IHR5cGUgTW9ja2VkRnVuY3Rpb25EZWVwPFQgZXh0ZW5kcyBQcm9jZWR1cmU+ID0gTW9ja1dpdGhBcmdzPFQ+ICYgTW9ja2VkT2JqZWN0RGVlcDxUPlxuZXhwb3J0IHR5cGUgTW9ja2VkT2JqZWN0PFQ+ID0gTWF5YmVNb2NrZWRDb25zdHJ1Y3RvcjxUPiAmIHtcbiAgW0sgaW4gTWV0aG9kczxUPl06IFRbS10gZXh0ZW5kcyBQcm9jZWR1cmVcbiAgICA/IE1vY2tlZEZ1bmN0aW9uPFRbS10+XG4gICAgOiBUW0tdO1xufSAmIHsgW0sgaW4gUHJvcGVydGllczxUPl06IFRbS10gfVxuZXhwb3J0IHR5cGUgTW9ja2VkT2JqZWN0RGVlcDxUPiA9IE1heWJlTW9ja2VkQ29uc3RydWN0b3I8VD4gJiB7XG4gIFtLIGluIE1ldGhvZHM8VD5dOiBUW0tdIGV4dGVuZHMgUHJvY2VkdXJlXG4gICAgPyBNb2NrZWRGdW5jdGlvbkRlZXA8VFtLXT5cbiAgICA6IFRbS107XG59ICYgeyBbSyBpbiBQcm9wZXJ0aWVzPFQ+XTogTWF5YmVNb2NrZWREZWVwPFRbS10+IH1cblxuZXhwb3J0IHR5cGUgTWF5YmVNb2NrZWREZWVwPFQ+ID0gVCBleHRlbmRzIFByb2NlZHVyZVxuICA/IE1vY2tlZEZ1bmN0aW9uRGVlcDxUPlxuICA6IFQgZXh0ZW5kcyBvYmplY3RcbiAgICA/IE1vY2tlZE9iamVjdERlZXA8VD5cbiAgICA6IFRcblxuZXhwb3J0IHR5cGUgTWF5YmVNb2NrZWQ8VD4gPSBUIGV4dGVuZHMgUHJvY2VkdXJlXG4gID8gTW9ja2VkRnVuY3Rpb248VD5cbiAgOiBUIGV4dGVuZHMgb2JqZWN0XG4gICAgPyBNb2NrZWRPYmplY3Q8VD5cbiAgICA6IFRcblxuZXhwb3J0IHR5cGUgRW5oYW5jZWRTcHk8VEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IGFueVtdLCBUUmV0dXJucyA9IGFueT4gPSBKZXN0TW9ja0NvbXBhdDxUQXJncywgVFJldHVybnM+ICYgU3B5SW1wbDxUQXJncywgVFJldHVybnM+XG5cbmV4cG9ydCBpbnRlcmZhY2UgTW9ja1dpdGhBcmdzPFQgZXh0ZW5kcyBQcm9jZWR1cmU+XG4gIGV4dGVuZHMgSmVzdE1vY2tDb21wYXRGbjxQYXJhbWV0ZXJzPFQ+LCBSZXR1cm5UeXBlPFQ+PiB7XG4gIG5ldyAoLi4uYXJnczogVCBleHRlbmRzIG5ldyAoLi4uYXJnczogYW55KSA9PiBhbnkgPyBDb25zdHJ1Y3RvclBhcmFtZXRlcnM8VD4gOiBuZXZlcik6IFRcbiAgKC4uLmFyZ3M6IFBhcmFtZXRlcnM8VD4pOiBSZXR1cm5UeXBlPFQ+XG59XG5cbmV4cG9ydCBjb25zdCBzcGllcyA9IG5ldyBTZXQ8SmVzdE1vY2tDb21wYXQ+KClcblxuZXhwb3J0IGZ1bmN0aW9uIGlzTW9ja0Z1bmN0aW9uKGZuOiBhbnkpOiBmbiBpcyBFbmhhbmNlZFNweSB7XG4gIHJldHVybiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbidcbiAgJiYgJ19faXNTcHknIGluIGZuXG4gICYmIGZuLl9faXNTcHlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNweU9uPFQsIFMgZXh0ZW5kcyBQcm9wZXJ0aWVzPFJlcXVpcmVkPFQ+Pj4oXG4gIG9iajogVCxcbiAgbWV0aG9kTmFtZTogUyxcbiAgYWNjZXNUeXBlOiAnZ2V0Jyxcbik6IEplc3RNb2NrQ29tcGF0PFtdLCBUW1NdPlxuZXhwb3J0IGZ1bmN0aW9uIHNweU9uPFQsIEcgZXh0ZW5kcyBQcm9wZXJ0aWVzPFJlcXVpcmVkPFQ+Pj4oXG4gIG9iajogVCxcbiAgbWV0aG9kTmFtZTogRyxcbiAgYWNjZXNUeXBlOiAnc2V0Jyxcbik6IEplc3RNb2NrQ29tcGF0PFtUW0ddXSwgdm9pZD5cbmV4cG9ydCBmdW5jdGlvbiBzcHlPbjxULCBNIGV4dGVuZHMgQ2xhc3NlczxSZXF1aXJlZDxUPj4+KFxuICBvYmplY3Q6IFQsXG4gIG1ldGhvZDogTVxuKTogUmVxdWlyZWQ8VD5bTV0gZXh0ZW5kcyBuZXcgKC4uLmFyZ3M6IGluZmVyIEEpID0+IGluZmVyIFJcbiAgPyBKZXN0TW9ja0NvbXBhdDxBLCBSPlxuICA6IG5ldmVyXG5leHBvcnQgZnVuY3Rpb24gc3B5T248VCwgTSBleHRlbmRzIE1ldGhvZHM8UmVxdWlyZWQ8VD4+PihcbiAgb2JqOiBULFxuICBtZXRob2ROYW1lOiBNLFxuICBtb2NrPzogVFtNXVxuKTogUmVxdWlyZWQ8VD5bTV0gZXh0ZW5kcyAoLi4uYXJnczogaW5mZXIgQSkgPT4gaW5mZXIgUiA/IEplc3RNb2NrQ29tcGF0PEEsIFI+IDogbmV2ZXJcbmV4cG9ydCBmdW5jdGlvbiBzcHlPbjxULCBLIGV4dGVuZHMga2V5b2YgVD4oXG4gIG9iajogVCxcbiAgbWV0aG9kOiBLLFxuICBhY2Nlc3NUeXBlPzogJ2dldCcgfCAnc2V0Jyxcbik6IEplc3RNb2NrQ29tcGF0IHtcbiAgY29uc3QgZGljdGlvbmFyeSA9IHtcbiAgICBnZXQ6ICdnZXR0ZXInLFxuICAgIHNldDogJ3NldHRlcicsXG4gIH0gYXMgY29uc3RcbiAgY29uc3Qgb2JqTWV0aG9kID0gYWNjZXNzVHlwZSA/IHsgW2RpY3Rpb25hcnlbYWNjZXNzVHlwZV1dOiBtZXRob2QgfSA6IG1ldGhvZFxuXG4gIGNvbnN0IHN0dWIgPSB0aW55c3B5LnNweU9uKG9iaiwgb2JqTWV0aG9kIGFzIGFueSlcblxuICByZXR1cm4gZW5oYW5jZVNweShzdHViKSBhcyBKZXN0TW9ja0NvbXBhdFxufVxuXG5sZXQgY2FsbE9yZGVyID0gMFxuXG5mdW5jdGlvbiBlbmhhbmNlU3B5PFRBcmdzIGV4dGVuZHMgYW55W10sIFRSZXR1cm5zPihcbiAgc3B5OiBTcHlJbXBsPFRBcmdzLCBUUmV0dXJucz4sXG4pOiBKZXN0TW9ja0NvbXBhdDxUQXJncywgVFJldHVybnM+IHtcbiAgY29uc3Qgc3R1YiA9IHNweSBhcyB1bmtub3duIGFzIEVuaGFuY2VkU3B5PFRBcmdzLCBUUmV0dXJucz5cblxuICBsZXQgaW1wbGVtZW50YXRpb246ICgoLi4uYXJnczogVEFyZ3MpID0+IFRSZXR1cm5zKSB8IHVuZGVmaW5lZFxuXG4gIGxldCBpbnN0YW5jZXM6IGFueVtdID0gW11cbiAgbGV0IGludm9jYXRpb25zOiBudW1iZXJbXSA9IFtdXG5cbiAgY29uc3QgbW9ja0NvbnRleHQgPSB7XG4gICAgZ2V0IGNhbGxzKCkge1xuICAgICAgcmV0dXJuIHN0dWIuY2FsbHNcbiAgICB9LFxuICAgIGdldCBpbnN0YW5jZXMoKSB7XG4gICAgICByZXR1cm4gaW5zdGFuY2VzXG4gICAgfSxcbiAgICBnZXQgaW52b2NhdGlvbkNhbGxPcmRlcigpIHtcbiAgICAgIHJldHVybiBpbnZvY2F0aW9uc1xuICAgIH0sXG4gICAgZ2V0IHJlc3VsdHMoKSB7XG4gICAgICByZXR1cm4gc3R1Yi5yZXN1bHRzLm1hcCgoW2NhbGxUeXBlLCB2YWx1ZV0pID0+IHtcbiAgICAgICAgY29uc3QgdHlwZSA9IGNhbGxUeXBlID09PSAnZXJyb3InID8gJ3Rocm93JyA6ICdyZXR1cm4nXG4gICAgICAgIHJldHVybiB7IHR5cGUsIHZhbHVlIH1cbiAgICAgIH0pXG4gICAgfSxcbiAgfVxuXG4gIGxldCBvbmNlSW1wbGVtZW50YXRpb25zOiAoKC4uLmFyZ3M6IFRBcmdzKSA9PiBUUmV0dXJucylbXSA9IFtdXG5cbiAgbGV0IG5hbWU6IHN0cmluZyA9IChzdHViIGFzIGFueSkubmFtZVxuXG4gIHN0dWIuZ2V0TW9ja05hbWUgPSAoKSA9PiBuYW1lIHx8ICd2aS5mbigpJ1xuICBzdHViLm1vY2tOYW1lID0gKG4pID0+IHtcbiAgICBuYW1lID0gblxuICAgIHJldHVybiBzdHViXG4gIH1cblxuICBzdHViLm1vY2tDbGVhciA9ICgpID0+IHtcbiAgICBzdHViLnJlc2V0KClcbiAgICBpbnN0YW5jZXMgPSBbXVxuICAgIGludm9jYXRpb25zID0gW11cbiAgICByZXR1cm4gc3R1YlxuICB9XG5cbiAgc3R1Yi5tb2NrUmVzZXQgPSAoKSA9PiB7XG4gICAgc3R1Yi5tb2NrQ2xlYXIoKVxuICAgIGltcGxlbWVudGF0aW9uID0gKCkgPT4gdW5kZWZpbmVkIGFzIHVua25vd24gYXMgVFJldHVybnNcbiAgICBvbmNlSW1wbGVtZW50YXRpb25zID0gW11cbiAgICByZXR1cm4gc3R1YlxuICB9XG5cbiAgc3R1Yi5tb2NrUmVzdG9yZSA9ICgpID0+IHtcbiAgICBzdHViLm1vY2tSZXNldCgpXG4gICAgaW1wbGVtZW50YXRpb24gPSB1bmRlZmluZWRcbiAgICByZXR1cm4gc3R1YlxuICB9XG5cbiAgc3R1Yi5nZXRNb2NrSW1wbGVtZW50YXRpb24gPSAoKSA9PiBpbXBsZW1lbnRhdGlvblxuICBzdHViLm1vY2tJbXBsZW1lbnRhdGlvbiA9IChmbjogKC4uLmFyZ3M6IFRBcmdzKSA9PiBUUmV0dXJucykgPT4ge1xuICAgIGltcGxlbWVudGF0aW9uID0gZm5cbiAgICByZXR1cm4gc3R1YlxuICB9XG5cbiAgc3R1Yi5tb2NrSW1wbGVtZW50YXRpb25PbmNlID0gKGZuOiAoLi4uYXJnczogVEFyZ3MpID0+IFRSZXR1cm5zKSA9PiB7XG4gICAgb25jZUltcGxlbWVudGF0aW9ucy5wdXNoKGZuKVxuICAgIHJldHVybiBzdHViXG4gIH1cblxuICBzdHViLm1vY2tSZXR1cm5UaGlzID0gKCkgPT5cbiAgICBzdHViLm1vY2tJbXBsZW1lbnRhdGlvbihmdW5jdGlvbih0aGlzOiBUUmV0dXJucykge1xuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9KVxuXG4gIHN0dWIubW9ja1JldHVyblZhbHVlID0gKHZhbDogVFJldHVybnMpID0+IHN0dWIubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+IHZhbClcbiAgc3R1Yi5tb2NrUmV0dXJuVmFsdWVPbmNlID0gKHZhbDogVFJldHVybnMpID0+IHN0dWIubW9ja0ltcGxlbWVudGF0aW9uT25jZSgoKSA9PiB2YWwpXG5cbiAgc3R1Yi5tb2NrUmVzb2x2ZWRWYWx1ZSA9ICh2YWw6IEF3YWl0ZWQ8VFJldHVybnM+KSA9PlxuICAgIHN0dWIubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+IFByb21pc2UucmVzb2x2ZSh2YWwgYXMgVFJldHVybnMpKVxuXG4gIHN0dWIubW9ja1Jlc29sdmVkVmFsdWVPbmNlID0gKHZhbDogQXdhaXRlZDxUUmV0dXJucz4pID0+XG4gICAgc3R1Yi5tb2NrSW1wbGVtZW50YXRpb25PbmNlKCgpID0+IFByb21pc2UucmVzb2x2ZSh2YWwgYXMgVFJldHVybnMpKVxuXG4gIHN0dWIubW9ja1JlamVjdGVkVmFsdWUgPSAodmFsOiB1bmtub3duKSA9PlxuICAgIHN0dWIubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+IFByb21pc2UucmVqZWN0KHZhbCkpXG5cbiAgc3R1Yi5tb2NrUmVqZWN0ZWRWYWx1ZU9uY2UgPSAodmFsOiB1bmtub3duKSA9PlxuICAgIHN0dWIubW9ja0ltcGxlbWVudGF0aW9uT25jZSgoKSA9PiBQcm9taXNlLnJlamVjdCh2YWwpKVxuXG4gIHV0aWwuYWRkUHJvcGVydHkoc3R1YiwgJ21vY2snLCAoKSA9PiBtb2NrQ29udGV4dClcblxuICBzdHViLndpbGxDYWxsKGZ1bmN0aW9uKHRoaXM6IHVua25vd24sIC4uLmFyZ3MpIHtcbiAgICBpbnN0YW5jZXMucHVzaCh0aGlzKVxuICAgIGludm9jYXRpb25zLnB1c2goKytjYWxsT3JkZXIpXG4gICAgY29uc3QgaW1wbCA9IG9uY2VJbXBsZW1lbnRhdGlvbnMuc2hpZnQoKSB8fCBpbXBsZW1lbnRhdGlvbiB8fCBzdHViLmdldE9yaWdpbmFsKCkgfHwgKCgpID0+IHt9KVxuICAgIHJldHVybiBpbXBsLmFwcGx5KHRoaXMsIGFyZ3MpXG4gIH0pXG5cbiAgc3BpZXMuYWRkKHN0dWIpXG5cbiAgcmV0dXJuIHN0dWIgYXMgYW55XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbjxUQXJncyBleHRlbmRzIGFueVtdID0gYW55W10sIFIgPSBhbnk+KCk6IEplc3RNb2NrQ29tcGF0Rm48VEFyZ3MsIFI+XG5leHBvcnQgZnVuY3Rpb24gZm48VEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IGFueVtdLCBSID0gYW55PihcbiAgaW1wbGVtZW50YXRpb246ICguLi5hcmdzOiBUQXJncykgPT4gUlxuKTogSmVzdE1vY2tDb21wYXRGbjxUQXJncywgUj5cbmV4cG9ydCBmdW5jdGlvbiBmbjxUQXJncyBleHRlbmRzIGFueVtdID0gYW55W10sIFIgPSBhbnk+KFxuICBpbXBsZW1lbnRhdGlvbj86ICguLi5hcmdzOiBUQXJncykgPT4gUixcbik6IEplc3RNb2NrQ29tcGF0Rm48VEFyZ3MsIFI+IHtcbiAgcmV0dXJuIGVuaGFuY2VTcHkodGlueXNweS5zcHlPbih7IGZuOiBpbXBsZW1lbnRhdGlvbiB8fCAoKCkgPT4ge30pIH0sICdmbicpKSBhcyB1bmtub3duIGFzIEplc3RNb2NrQ29tcGF0Rm5cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFWSxNQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsR0FBRztBQUN4QixTQUFTLGNBQWMsQ0FBQyxHQUFHLEVBQUU7QUFDcEMsRUFBRSxPQUFPLE9BQU8sR0FBRyxLQUFLLFVBQVUsSUFBSSxTQUFTLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUM7QUFDdEUsQ0FBQztBQUNNLFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVB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
