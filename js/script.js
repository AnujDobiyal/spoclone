let currentSong = new Audio();
let songs;
let currFolder;

async function firstFolder(){
    let a = await fetch(`./songs/`)
    let response = await a.text()

    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")

    let index;

    for (index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.includes("/songs/")){
            break
        }
    }

    return as[index].href.split("/").slice(-2)[0]
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`./${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ''
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
        <li>
            <div><img src="svgs/music.svg" alt=""></div>
            <div class="info line-clamp-2">${song.replaceAll("%20", " ")}</div>
            <div class="playNow">
                <img class="invert" src="svgs/play.svg" alt="">
            </div>
        </li> `
    }

    //Attach a eventListner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").textContent)
        })
    });
}

function secTOminsec(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(remainingSeconds).padStart(2, '0')

    return `${formattedMinutes}:${formattedSeconds}`
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "svgs/paused.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".timeInfo").innerHTML = `00:00 / 00:00`
}

async function displayAlbums() {
    let a = await fetch('./songs/')
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;

    let ans = div.getElementsByTagName("a")
    let array = Array.from(ans)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            //Get the metadata of the folder
            let a = await fetch(`./songs/${folder}/info.json`)
            let response = await a.json()
            document.querySelector(".cardContainer").innerHTML = document.querySelector(".cardContainer").innerHTML + `<div data-folder="${folder}" class="card">
                        <img src="/songs/${folder}/cover.jpg" alt="">

                        <div class="play">
                            <svg data-encore-id="icon" role="img" aria-hidden="true"
                                class="Svg-sc-ytk21e-0 bneLcE e-9541-icon" viewBox="0 0 24 24">
                                <path
                                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z">
                                </path>
                            </svg>
                        </div>

                        <h2 class="line-clamp-2">${response.title}</h2>
                        <p class="line-clamp-1">${response.desc}</p>
                    </div>`
        }
    }

    //Load the playlist when folder is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(`songs/${item.currentTarget.dataset.folder}`)

            playMusic(songs[0])
        })
    })
    
}

function autoPlaySong(){
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

    if(autoplay.src.includes("loop.svg"))
    {
        if((index + 1) < songs.length){
            playMusic(songs[index+1])
        }
        else{
            playMusic(songs[0])
        }
    }
    else if(autoplay.src.includes("shuffle.svg")){
        let rand = Math.floor(Math.random() * songs.length)
        playMusic(songs[rand])
    }
    else{
        currentSong.currentTime = 0
        playMusic(songs[index])
    }
}

async function main() {
    //get the list of all songs of first album
    await getSongs(`songs/${await firstFolder()}`)
    playMusic(songs[0], true)
    
    //Display all the Albums on the Page
    displayAlbums()

    //Attach a Eventlistner to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused && currentSong.src != "") {
            currentSong.play()
            play.src = "/svgs/paused.svg"
        }
        else {
            currentSong.pause()
            play.src = "/svgs/play.svg"
        }
    })

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".timeInfo").innerHTML = `${secTOminsec(currentSong.currentTime)} / ${secTOminsec(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"

        //autoPlaycall
        if(currentSong.currentTime == currentSong.duration){
            autoPlaySong()
        }
    })

    //Add an eventlistner to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })

    //Add a eventlister to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0
    })

    //Add a eventlister to close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = -110 + "%"
    })

    //Add eventlistner to previous and next
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    let volumeRange = document.querySelector(".range").getElementsByTagName("input")[0]
    let volumeButton = document.querySelector(".volume>img")
    
    //Add an eventlistner to volume
    volumeRange.addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100

        if(currentSong.volume == 0){
            volumeButton.src = volumeButton.src.replace("volume.svg", "mute.svg")
        }
        else{
            volumeButton.src = volumeButton.src.replace("mute.svg", "volume.svg")
        }
    })

    //Add eventlistner to mute the track
    volumeButton.addEventListener("click", e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0
            volumeRange.value = 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.1
            volumeRange.value = 10
        }
    })

    autoplay.addEventListener("click", e=>{
        if(e.target.src.includes("loop.svg")){
            e.target.src = e.target.src.replace("loop.svg", "shuffle.svg")
        }
        else if(e.target.src.includes("shuffle.svg")){
            e.target.src = e.target.src.replace("shuffle.svg", "loopOne.svg")
        }
        else{
            e.target.src = e.target.src.replace("loopOne.svg", "loop.svg")
        }
    })
}

main()