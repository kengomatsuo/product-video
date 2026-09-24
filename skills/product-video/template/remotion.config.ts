import { Config } from '@remotion/cli/config';

/* PNG frames keep gradients and UI text free of JPEG blocking */
Config.setVideoImageFormat('png');
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);

/* WebGL2 for the watercolour painter and 3D devices */
Config.setChromiumOpenGlRenderer('angle');
