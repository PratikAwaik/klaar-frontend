export function getIndex(arr, item) {
  let index = null;
  arr.forEach((element, idx) => {
    if (JSON.stringify(element) === JSON.stringify(item)) index = idx;
  });
  return index;
}
