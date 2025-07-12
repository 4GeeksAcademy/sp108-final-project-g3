export const initialStore = () => {
  return {
    message: null,
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type) {

    case 'set_hello':
      return { ...store, message: action.payload };
      
    default:
      throw Error('Unknown action.');

    }    
}
