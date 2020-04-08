
// https://medium.com/@bitshadow/play-audio-via-react-fetch-post-request-92a901d0bb7f

export const readAudioStream = ( res: Response ) => {
    const reader = res.body!.getReader()
    return reader
        .read()
        .then((result) => {
            return result;
        });
}

export const audio = new Audio()
export const playAudioStream = ( res: ReadableStreamReadResult<Uint8Array> ) => {
    const blob = new Blob([res.value!], { type: 'audio/mp3' });
    const url = window.URL.createObjectURL(blob)
    audio.src = url;
    audio.play();
}
