import os

def fix_detail_room():
    path = "src/pages/DetailRoom.jsx"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # The buggy string is:
    #      </div>
    #      <BottomNav role="guru" />
    #      <ConfirmDialog
    #        open={showDeleteConfirm}
    
    # We want to remove the extra </div> and <BottomNav> before the first ConfirmDialog.
    # Actually, the original code had:
    #      <ConfirmDialog
    #        open={showDeleteConfirm}
    # ...
    #      <ConfirmDialog
    #        open={Boolean(deleteQuestionTarget)}
    
    # The correct place for </div> and <BottomNav> is BEFORE the FIRST ConfirmDialog.
    # Wait, the first ConfirmDialog was replaced.
    # So the first one has:
    #      </div>
    #      <BottomNav role="guru" />
    #      <ConfirmDialog
    
    # And the second one ALSO has:
    #      </div>
    #      <BottomNav role="guru" />
    #      <ConfirmDialog
    
    # Let's just remove ALL injected wrappers: `</div>\n      <BottomNav role="guru" />\n      <ConfirmDialog` -> `      <ConfirmDialog`
    content = content.replace('      </div>\n      <BottomNav role="guru" />\n      <ConfirmDialog', '      <ConfirmDialog')
    
    # Now we inject it correctly exactly ONCE before the very first <ConfirmDialog
    content = content.replace('      <ConfirmDialog', '      </div>\n      <BottomNav role="guru" />\n      <ConfirmDialog', 1)
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    fix_detail_room()
