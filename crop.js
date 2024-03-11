const extensions = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

function createButton(textContent) {
    const button = document.createElement('button');
    button.textContent = textContent;
    return button;
}

function crop(image) {
    return new Cropper(image, {
        dragMode: 'move',
        preview: '#preview-crop',
    })
}

const avatarImage = document.querySelector('#avatar-image');
const h2Avatar = document.querySelector('#h2-avatar');
let cropper; // Define cropper variable outside of event listeners

avatarImage.addEventListener('change', event => {
    const preview = document.querySelector('#preview-image');
    const previewImage = document.createElement('img');

    if (preview) {
        preview.remove();
    }

    const reader = new FileReader;

    reader.onload = function (event) {
        previewImage.id = 'preview-image';
        previewImage.src = event.target.result;
        h2Avatar.insertAdjacentElement('afterend', previewImage);
    }

    reader.readAsDataURL(avatarImage.files[0]);

    setTimeout(() => {
        cropper = crop(previewImage);
        let previewCrop = document.querySelector('#preview-crop');
        previewCrop.style = 'display:block';

        const removeCropButton = createButton('Remove Crop');
        const uploadButton = createButton('Upload');

        h2Avatar.insertAdjacentElement('afterend', removeCropButton);
        h2Avatar.insertAdjacentElement('afterend', uploadButton);

        removeCropButton.addEventListener('click', event => {
            cropper.destroy();
            removeCropButton.remove();
            uploadButton.remove();
            previewImage.remove();
            previewCrop.style = 'display:none';
            document.getElementById('downloadButton').style.display = 'none'; // Hide download button when removing crop
        })

        uploadButton.addEventListener('click', event => {
            console.log(cropper);
            if (cropper.cropped) {
                cropper.getCroppedCanvas().toBlob(async blob => {
                    try {
                        const formData = new FormData;
                        formData.append('file', blob);
                        formData.append('extension', extensions[blob.type]);

                        const response = await fetch('http://localhost:8000', {
                            method: 'post',
                            body: formData
                        })

                        if (!response.ok) {
                            throw await response.json();
                        }

                        if (await response.json() === 'uploaded') {
                            Swal.fire(
                                'Uploaded',
                                'Upload feito com sucesso',
                                'success'
                            )
                            setTimeout(() => {
                                window.location.reload();
                            }, 3000)

                            // Show download button after successful upload
                            document.getElementById('downloadButton').style.display = 'block';
                        } else {
                            Swal.fire(
                                'Atenção',
                                'Ocorreu um erro ao fazer o upload da imagem!',
                                'error'
                            )
                        }
                    } catch (error) {
                        console.log(error);
                    }
                })
            } else {
                // Handle case when no cropping has been done
            }
        })

    }, 200)

})

// Function to handle download button click
document.getElementById('downloadButton').addEventListener('click', function() {
    if (cropper && cropper.cropped) {
        const croppedImage = cropper.getCroppedCanvas().toDataURL();
        const a = document.createElement('a');
        a.href = croppedImage;
        a.download = 'cropped_image.png'; // Change the filename as needed
        a.click();
    } else {
        alert("Please crop an image first.");
    }
});