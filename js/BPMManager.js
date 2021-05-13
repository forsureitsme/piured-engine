"use strict" ;



class BPMManager {


    constructor(bpmList, scrollList, speed) {

        this.speed = speed ;
        this.bpmList = bpmList ;
        this.scrollList = scrollList ;

    }

    getBPMAtBeat(beat) {

        for (let bpmInfo of this.bpmList) {
            if (beat <= bpmInfo[0] ) {
                return bpmInfo[1] ;
            }
        }

    }

    getScrollAtBeat(beat) {
        const tickCounts = this.scrollList ;
        let last = tickCounts[0];
        for ( const tickCount of tickCounts ) {
            const beatInTick = tickCount[0] ;
            const tick = tickCount[1] ;
            if ( beat >= beatInTick ) {
                last = tickCount ;
            } else {
                return last ;
            }
        }
        return last ;
    }

    getScrollsInBeatInterval(lowerBound, upperBound) {
        let lowerBoundScroll = this.getScrollAtBeat(lowerBound);
        let list = [[lowerBound,lowerBoundScroll[1]]] ;

        // list.push(this.getScrollValueAtBeat(lowerBound)) ;
        const scrollList = this.scrollList ;

        for ( var i = 0 ; i < scrollList.length ; i++ ) {

            const beatInScroll = scrollList[i][0] ;
            const nextBeatInScroll = scrollList[i+1] !== undefined ? scrollList[i+1][0] : undefined  ;

            if ( (beatInScroll > lowerBound &&
                ( beatInScroll < upperBound || upperBound ===undefined) )  &&
                beatInScroll !==  lowerBoundScroll[0]  ) {
                list.push(scrollList[i]) ;
            } else if ( beatInScroll >= upperBound) {
                break ;
            }
        }

        return list ;

    }


    // this function calculates the YDisplacement and currentTime in song to construct the scene with the steps.
    getYShiftAndCurrentTimeInSongAtBeat( barIndex, noteInBarIndex, notesInBar ) {

        let yShift = 0.0 ;
        let currentTimeInSong = 0.0 ;

        // calculate current beat
        const beat = (4*barIndex + 4*noteInBarIndex/notesInBar) ;

        // iterate all bpms
         for (var i = 0 ; i < this.bpmList.length ; i++ ) {



             // const scrollBeat = this.scrollList[j][0] ;
             // const scrollSpeed = this.scrollList[j][1] ;

             // retrieve bpm and beat from the list
             let bpmInfo = this.bpmList [i];
             const beatInList = bpmInfo[0];

             // also retrieve nextBeat from the list if possible.
             let nextBeatInList = this.bpmList [i + 1] !== undefined ? this.bpmList [i + 1][0] : undefined;


             // this condition is met when the beat corresponds to the current chunk of beats (beatInList, nextBeatInList)

             //iterate scrolls
             let scrollList = this.getScrollsInBeatInterval(beatInList, nextBeatInList) ;

             if (beat >= beatInList && (beat < nextBeatInList || nextBeatInList === undefined)) {



                 // calculate contribution of each scroll in the position.
                 for ( var j = 0; j < scrollList.length ; j++ ) {
                     const scroll = scrollList[j] ;
                     const scrollBeat = scroll[0] ;
                     const scrollValue = scroll [1] ;
                     const nextScroll = scrollList[j+1] ;

                     if ( nextScroll !== undefined && beat >= nextScroll[0] ) {
                         yShift += -(nextScroll[0] - scrollBeat) * this.speed * scrollValue ;
                     } else {
                         yShift += -(beat - scrollBeat) * this.speed * scrollValue ;
                         break ;
                     }

                 }

                 // we calculate the proportion of time and displacement that this bpm would contribute.
                 const secondsPerBeat = 60 / bpmInfo[1];

                 currentTimeInSong += (beat - beatInList) * secondsPerBeat;

                 break;

                 // otherwise, the whole chunk is contributed.
             } else {

                 const secondsPerBeat = 60 / bpmInfo[1];


                 // calculate contribution of each scroll in the position.
                 for ( var j = 0; j < scrollList.length ; j++ ) {
                     const scroll = scrollList[j] ;
                     const scrollBeat = scroll[0] ;
                     const scrollValue = scroll [1] ;
                     const nextScroll = scrollList[j+1] ;

                     // there is an error over here.
                     if ( nextScroll === undefined ) {
                         yShift += -(nextBeatInList - scrollBeat) * this.speed * scrollValue ;
                     } else {
                         yShift += -(nextScroll[0] - scrollBeat) * this.speed * scrollValue ;
                     }

                     // this before
                     // if ( nextScroll === undefined ) {
                     //     yShift += -(nextScroll[0] - scrollBeat) * this.speed * scrollValue ;
                     // } else {
                     //     yShift += -(nextBeatInList - scrollBeat) * this.speed * scrollValue ;
                     // }


                 }

                 // yShift += -(nextBeatInList - beatInList) * this.speed ;

                 currentTimeInSong += (nextBeatInList - beatInList) * secondsPerBeat;
             }


         }

         return [yShift, currentTimeInSong] ;
    }


    // Note that YShift tells you exactly the current beat given the currentAudio time.
    getYShiftAtCurrentAudioTime(currentAudioTime) {

        // this is what we want to calculate.
        let yShift = 0.0 ;
        let currentBeat = 0.0 ;

        let totalSeconds = 0.0 ;


        for (var i = 0 ; i < this.bpmList.length ; i++ ) {
            let bpmInfo = this.bpmList [i] ;


            let nextBeatInList = this.bpmList [i+1] !== undefined ? this.bpmList [i+1][0] : undefined ;
            const beatInList = bpmInfo[0] ;
            const bpm = bpmInfo[1] ;


            let secondsInSlot = ((nextBeatInList - beatInList) /  bpm) * 60 ;

            //iterate scrolls
            let scrollList = this.getScrollsInBeatInterval(beatInList, nextBeatInList) ;


            if ( nextBeatInList  !== undefined && currentAudioTime >= secondsInSlot + totalSeconds ) {

                // calculate contribution of each scroll in the position.
                for ( var j = 0; j < scrollList.length ; j++ ) {
                    const scroll = scrollList[j] ;
                    const scrollBeat = scroll[0] ;
                    const scrollValue = scroll [1] ;
                    const nextScroll = scrollList[j] ;

                    if ( nextScroll === undefined ) {
                        yShift += (nextScroll[0] - scrollBeat) * scrollValue ;
                    } else {
                        yShift += (nextBeatInList - scrollBeat) *  scrollValue ;
                    }

                }


                currentBeat += (nextBeatInList - beatInList) ;


            } else {


                const elapseTime = currentAudioTime - totalSeconds ;
                const beatElapse = (bpm / 60)*elapseTime ;


                currentBeat += beatElapse ;


                // calculate contribution of each scroll in the position.
                for ( var j = 0; j < scrollList.length ; j++ ) {
                    const scroll = scrollList[j] ;
                    const scrollBeat = scroll[0] ;
                    const scrollValue = scroll [1] ;
                    const nextScroll = scrollList[j+1] ;

                    if ( nextScroll !== undefined && currentBeat >= nextScroll[0] ) {
                        yShift += (nextScroll[0] - scrollBeat) * scrollValue ;
                    } else {
                        yShift += (currentBeat - scrollBeat) * scrollValue ;
                        break ;
                    }

                }

                break ;
            }

            totalSeconds += ((nextBeatInList - beatInList) /  bpm) * 60 ;



        }

        return [yShift, currentBeat] ;
    }



}