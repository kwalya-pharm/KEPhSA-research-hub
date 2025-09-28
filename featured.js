document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('dynamic-gallery');
    const items = Array.from(gallery.querySelectorAll('.gallery-item'));

    items.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            const imgSrc = item.querySelector('img').src;

            // Create overlay
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = 0;
            overlay.style.left = 0;
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.background = 'rgba(0,0,0,0.9)';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.zIndex = 9999;

            // Create full image
            const fullImg = document.createElement('img');
            fullImg.src = imgSrc;
            fullImg.style.maxWidth = '90%';
            fullImg.style.maxHeight = '90%';
            fullImg.style.borderRadius = '12px';
            overlay.appendChild(fullImg);

            // Create close button
            const closeBtn = document.createElement('span');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '20px';
            closeBtn.style.right = '30px';
            closeBtn.style.fontSize = '40px';
            closeBtn.style.color = '#fff';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.fontWeight = 'bold';
            closeBtn.style.zIndex = '10000';
            overlay.appendChild(closeBtn);

            closeBtn.addEventListener('click', () => {
                document.body.removeChild(overlay);
            });

            document.body.appendChild(overlay);
        });
    });
});
