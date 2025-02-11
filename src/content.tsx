console.log('Content script loaded!');

interface ProductData {
  title: string;
  price: string;
  productLink: string;
  img: string;
}

setTimeout(() => {
  const results: ProductData[] = [];
  
  document.querySelectorAll<HTMLAnchorElement>("div[data-attrid='title'] a").forEach((link) => {
    // const title = link.innerText;
    // const productLink = link.href;
    // const price = document.querySelector<HTMLElement>(".BNeawe.iBp4i.AP7Wnd")?.innerText ?? "N/A";
    // const img = document.querySelector<HTMLImageElement>("img")?.src ?? "";

    const title = "baclls"
    const productLink = "balls.com"
    const price = "$100";
    const img = document.querySelector<HTMLImageElement>("img")?.src ?? "";

    results.push({ title, productLink, price, img });
  });

  chrome.runtime.sendMessage({ action: "sendProductData", data: results });
}, 5000);