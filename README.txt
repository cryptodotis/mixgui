I attached the TB extension for mixminion. I called it mixgui, but
better ideas are welcome. It can be installed as any other TB extension.
 When done, you'll find a bunch of menu items and buttons for:

- send/enqueue a message through mixminion (overlay for
messageCompose.xul).

- Reply to a SURB taken from a file  (overlay for messageCompose.xul).

- Build and attach a SURB to your forward and reply messages (send
option dialog box).

- Set Mixminion path in a preference window (item in "MixGui" menu).

- Get a list of servers infos (item in "MixGui" menu).

- List, flush and clean message queue (item in "MixGui" menu).

- Create and inspect a SURB file (item in "MixGui" menu).

- See and clean the output of Mixminon calls from the extension.

- Maybe others I have forgotten.

To make it work you need to install enigmail 0.95.7 (it seems not to
work with newer versions) and mixminion, of course. I developed it on TB
2.0, now trying to move to TB 3.x .
After mixgui has been installed, you should set mixminion path in the
extension preferences. If you do not do that, you will be prompted for
mixminion path as soon as mixminion is required to run.

The strong requirement about enigmail is due to the way mixgui interacts
with mixmionion. It uses ipc as enigmail does. Unfortunately this means
a strong dependency to it which could be acceptable but it not a safe
practice anyway. At the moment I am trying to find out a way to have my
own ipc component in order to avoid such a dependency.

Note that the attached .xpi is just a zip file, unzip it to get the
source code.