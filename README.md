In this repository I have managed to:

- Encode a source video into different bitrates,
- Package into a manifest,
- Play in Shaka Player,
- Encrypt the manifest using a raw key encryption, and
- Then play it using clearKey DRM.

### Extracting audio and video from an mp4 file:

I found that its a good practice to first split the audio and video from an original file and then perform your operations on the video only. This is probably optional and depends upon the use case and the ammount of restriction you're after. I haven't splitted the audio in the examples below (Its a choice).

```
./bin/packager in=./media/test.mp4,stream=video,out=video.mp4 \
 in=some_content.mp4,stream=audio,out=audio.mp4
```

### Encoding video into different bit rates

Suppose we have an input.mp4 file. This is an original 1080p video file. We encoding a video into multiple bit rates using FFmpeg and then we package it up into a DASH and/or HLS manifest using shaka-packager.

To encode into different h.264 bitrates here are the ffmpeg commands:

360p:

```
./ffmpeg -i ./media/test.mp4 -c:a copy \
 -vf "scale=-2:360" \
 -c:v libx264 -profile:v baseline -level:v 3.0 \
 -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 \
 -minrate 600k -maxrate 600k -bufsize 600k -b:v 600k \
 -y ./media/test_360p_600.mp4
```

480p:

```
./ffmpeg -i ./media/test.mp4 -c:a copy \
 -vf "scale=-2:480" \
 -c:v libx264 -profile:v main -level:v 3.1 \
 -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 \
 -minrate 1000k -maxrate 1000k -bufsize 1000k -b:v 1000k \
 -y ./media/test_480p_1000.mp4
```

720p:

```
./ffmpeg -i ./mediatest.mp4 -c:a copy \
 -vf "scale=-2:720" \
 -c:v libx264 -profile:v main -level:v 4.0 \
 -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 \
 -minrate 3000k -maxrate 3000k -bufsize 3000k -b:v 3000k \
 -y ./media/test_720p_3000.mp4
```

1080p:

```
./ffmpeg -i test.mp4 -c:a copy \
 -vf "scale=-2:1080" \
 -c:v libx264 -profile:v high -level:v 4.2 \
 -x264-params scenecut=0:open_gop=0:min-keyint=72:keyint=72 \
 -minrate 6000k -maxrate 6000k -bufsize 6000k -b:v 6000k \
 -y ./media/test_1080p_6000.mp4
```

Source: https://google.github.io/shaka-packager/html/tutorials/encoding.html

Now you’ll have 4 different versions of your test.mp4. A 360p, 480p, 720p, and 1080p version.

### DASH:

Let’s package the above generated files into a manifest to make sure we can do Adaptive bitrate switching. Here are the shaka-packager commands to do so:

```
./packager \
 in=./media/test_360p_600.mp4,stream=audio,output=audio.mp4 \
 in=./media/test_360p_600.mp4,stream=video,output=h264_360p.mp4 \
 in=./media/test_480p_1000.mp4,stream=video,output=h264_480p.mp4 \
 in=./media/test_720p_3000.mp4,stream=video,output=h264_720p.mp4 \
 in=./media/test_1080p_6000.mp4,stream=video,output=h264_1080p.mp4 \
 --mpd_output test.mpd
```

### Adding DRM:

For starters, we can enable a raw key encryption using the shaka-packager to encrypt the video with a given key.

Here is the `shaka-packager`s command to do so:

```
./bin/packager \
  in=./media/audio.mp4,stream=audio,output=audio.mp4,drm_label=AUDIO \
  in=./media/test_360p_600.mp4,stream=video,output=h264_360p.mp4,drm_label=SD \
  in=./media/test_480p_1000.mp4,stream=video,output=h264_480p.mp4,drm_label=SD \
  in=./media/test_720p_3000.mp4,stream=video,output=h264_720p.mp4,drm_label=HD \
  in=./media/test_1080p_6000.mp4,stream=video,output=h264_1080p.mp4,drm_label=HD \
  --enable_raw_key_encryption \
  --keys key_id=a7e61c373e219033c21091fa607bf3b8:key=76a6c65c5ea762046bd749a2e632ccbb \
  --clear_lead 0 \
  --mpd_output dash.mpd
```

Note the `key_id`, and `key` used to encrypt the video, without this key you would not be able to play this video in the player. Internally, the `shaka-packager` uses the `ffmpeg` tool which encrypts the video using a `cnec` standard. This is a same standard used by `clearKey` DRM so we can play this video in the player using a clear key drm (we don't need a license server for this). Beware that clear key means keys are visible to users and its not a secure way to handle DRM but still very good for testing and simple use cases.

Questions/Concerns:

The following questions popped into my head. I have not tried to find any answers yet.

- I noticed that it takes a lot of time to encode a video into different bitrates. How do we do this for longer videos?
- What other tools can we use to encode a video into different bitrates? How can we automate this process? I used FFmpeg.
