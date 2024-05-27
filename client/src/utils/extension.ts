const updateArray = <T>(arr: Array<T>, idx: number, newValue: T) => {
  return arr.map((value, index) => {
    return index === idx ? newValue : value;
  });
}

export {
  updateArray
}