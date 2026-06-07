import os

def fix_admin_pages():
    admin_files = ["DashboardAdmin.jsx", "AdminKamus.jsx", "AdminMateri.jsx", "AdminUsers.jsx", "AdminRooms.jsx"]
    src_dir = "src/pages"
    
    for f in admin_files:
        path = os.path.join(src_dir, f)
        if not os.path.exists(path):
            continue
            
        with open(path, "r", encoding="utf-8") as file:
            content = file.read()
            
        if "import BottomNav" not in content:
            content = 'import BottomNav from "../components/BottomNav";\n' + content
            
        # Admin components usually have a final </div> that closes the flex container.
        # It looks like:
        #           </main>
        #         </div>
        #       </div>
        #     );
        
        # We replace the outermost closing div with BottomNav included.
        if "BottomNav role=\"admin\"" not in content:
            content = content.replace(
                '        </main>\n      </div>\n    </div>\n  );\n}',
                '        </main>\n      </div>\n      <BottomNav role="admin" />\n    </div>\n  );\n}'
            )
            content = content.replace(
                '        </main>\n      </div>\n    </div>\n  );',
                '        </main>\n      </div>\n      <BottomNav role="admin" />\n    </div>\n  );'
            )
            # Also for the skeleton loading return:
            content = content.replace(
                '          </main>\n        </div>\n      </div>\n    );',
                '          </main>\n        </div>\n        <BottomNav role="admin" />\n      </div>\n    );'
            )
            
        with open(path, "w", encoding="utf-8") as file:
            file.write(content)

if __name__ == "__main__":
    fix_admin_pages()
