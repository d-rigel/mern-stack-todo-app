// function to handle infinite scroll call to api
export const read = async (skip) => {
  try {
    const res = await fetch(`http://localhost:3001/?skip=${skip}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  } catch (error) {
    throw new Error(error);
  }
};
