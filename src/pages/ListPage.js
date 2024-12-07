import React, { useState, useEffect } from "react";
import "../styles/ListPage.css";
import axios from "axios";
import { Modal, message, Switch } from "antd";


const LIST_MEDIA_PATH = "https://prod-14.northcentralus.logic.azure.com/workflows/ee44567268fb44bcaa126381ddf86b04/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=RPWoYFu4z6Xjio11tEUt8LF5olfGqY07t1p6phsInkQ";
const UPLOAD_MEDIA_PATH = "https://prod-12.northcentralus.logic.azure.com:443/workflows/9fd03f8852214500860142089f449f52/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=3j_oCxKOM9zw0sQaCC22NMo3OlQABy_c2HWo_Y77x1s"
const MEDIA_SUFFIX = "https://cw22.blob.core.windows.net"
const DELETE_MEDIA_PATH = "https://prod-01.northcentralus.logic.azure.com:443/workflows/0f46107f478a4338a013a852d04d355a/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=eso1W3FJeZzT1nkDohr7nqWbT98CuxzPWVQET8lc-g8"
const UPDATE_MEDIA_PATH = "https://prod-09.northcentralus.logic.azure.com:443/workflows/84c7150dc4d2429a99f7c984b3538700/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=0WE_Pi5cG0ioqaBW14ySn_tJ9lHWa3O1e_YHuSZF-1M"


const ListPage = () => {
    const [dataItems, setDataItems] = useState([]);
    const [mediaItems, setMediaItems] = useState([]);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [filter, setFilter] = useState("All");
    const [showForm, setShowForm] = useState(false); // 控制表单显示
    const [fileData, setFileData] = useState({
        file: null,
        fileType: "",
        fileSize: "",
        fileName: "",
        permission: "",
    });

    const [query, searchQuery] = useState("");
    const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(LIST_MEDIA_PATH);
      if (response.status === 200) {
        setMediaItems(response.data); // 假设返回的数据格式为 { value: [...] }
        setDataItems(response.data)
      } else {
          message.error("Failed to fetch media items.");
      }
    } catch (err) {
      message.error(err.message || "An error occurred while fetching media items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getFriendlyFileType = (mimeType) => {
    if (mimeType.startsWith("image")) return "Image";
    if (mimeType.startsWith("video")) return "Video";
    if (mimeType.startsWith("audio")) return "Audio";
    return "Unknown";
  };

  // 处理文件上传事件
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileData({
        ...fileData,
        file,
        fileType: getFriendlyFileType(file.type),
        fileSize: (file.size / 1024).toFixed(2) + " KB", // 文件大小（单位：KB）
        fileName: file.name,
      });
    }
  };

  // 处理权限选项
  const handlePermissionChange = (event) => {
    setFileData({ ...fileData, permission: event.target.value });
  };

  const updatePermission = async (item, isPublic) => {
    const newPermission = isPublic ? "public" : "private";
  
        const data = new FormData();
        data.append("id", item.id);
        data.append("file_path", item.file_path);
        data.append("file_name", item.file_name);
        data.append("file_type", item.file_type);
        data.append("upload_date", item.upload_date);
        data.append("file_size", item.file_size);
        data.append("user_id", item.user_id);
        data.append("user_name", item.user_name);
        data.append("permissions", newPermission);

        try {
            const response = await axios.put(UPDATE_MEDIA_PATH, data, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });
      
            if (response.status === 200) {
              message.success("Permission updated successfully!");
              fetchData();
            } else {
                message.error("Failed to update permission!");
            }
          } catch (err) {
            console.error("Error updating permission:", err);
            message.error("An error occurred while updating permission.");
          }
  };

  // 提交表单
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if(fileData.fileType === 'Unknown') {
        alert('File Type not Valid!')
        return
    }

    const user_id = sessionStorage.getItem("user_id");
    const user_name = sessionStorage.getItem("user_name");


    if (!user_id || !user_name) {
        alert("User not logged in.");
        return;
      }
  
      // 准备 form-data
      const data = new FormData();
      data.append("File", fileData.file);
      data.append("file_name", fileData.fileName);
      data.append("file_type", fileData.fileType);
      data.append("file_size", fileData.fileSize);
      data.append("user_id", user_id);
      data.append("user_name", user_name);
      data.append("permissions", fileData.permission);
  
      try {
        const response = await axios.post(UPLOAD_MEDIA_PATH, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        if (response.status === 200) {
          message.success("File uploaded successfully!");
          setShowForm(false); // 关闭表单
          fetchData();
        } else {
          message.error("File upload failed!");
        }
      } catch (err) {
        console.error("Error uploading file:", err);
        message.error("An error occurred during file upload.");
      }
  };


  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleMediaClick = (item) => {
    const media = MEDIA_SUFFIX + item.file_path
    window.open(media, "_blank");
  };



  const handleDelete = async (item) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: `Are you sure you want to delete "${item.file_name}"?`,
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const response = await axios.delete(`${DELETE_MEDIA_PATH}&documentId=${item.id}`);
          if (response.status === 200) {
            message.success("File deleted successfully!");
            setMediaItems(mediaItems.filter((media) => media.id !== item.id)); // 更新列表
          } else {
            message.error("Failed to delete the file.");
          }
        } catch (err) {
          console.error("Error deleting file:", err);
          message.error("An error occurred while deleting the file.");
        }
      },
    });
  };

  const filteredItemsByName = () => {
        if (query === "") {
            setMediaItems(dataItems)
        } else {
          const filteredItems = mediaItems.filter((item) => item.file_name.includes(query));
          setMediaItems(filteredItems)
        }
      
        
    };

  const filteredItems = mediaItems.filter((item) =>
    filter === "All" ? true : item.file_type === filter
  );

  

  return (
    <div className="list-page">
      <header className="list-page-header">
        <h1>Media Sharing Platform</h1>
        <div className="search-bar">
          <input value={query} onChange={(e) => searchQuery(e.target.value)} type="text" placeholder="Search..." />
          <button onClick={filteredItemsByName}>🔍</button>
        </div>
      </header>
      <div className="filter-options">
        <label>
          <input
            type="radio"
            name="filter"
            value="All"
            checked={filter === "All"}
            onChange={handleFilterChange}
          />
          All
        </label>
        <label>
          <input
            type="radio"
            name="filter"
            value="Image"
            checked={filter === "Image"}
            onChange={handleFilterChange}
          />
          Image
        </label>
        <label>
          <input
            type="radio"
            name="filter"
            value="Video"
            checked={filter === "Video"}
            onChange={handleFilterChange}
          />
          Video
        </label>
        <label>
          <input
            type="radio"
            name="filter"
            value="Audio"
            checked={filter === "Audio"}
            onChange={handleFilterChange}
          />
          Audio
        </label>
      </div>
      <div className="media-grid">
      {loading ? (
        <div>Loading media items...</div> // 在 media-grid 中显示加载提示
  ) :
        (filteredItems.map((item) => (
          <div
            key={item.id}
            className="media-item"
          >
            <div
                            onClick={() => handleMediaClick(item)}
                            onMouseEnter={() => setHoveredItem(item)} // 设置悬停的媒体项
                            onMouseLeave={() => setHoveredItem(null)} // 鼠标离开时清空
            >
                {item.file_type === "Image" ? (
                <img src={MEDIA_SUFFIX + item.file_path} alt={item.file_name} />
                ) : item.file_type === "Audio" ? (
                <img src="/Audio_file.png" alt="Audio Placeholder" />
                ) : item.file_type === "Video" ? (
                <img src="/video-file.png" alt="Video Placeholder" />
                ) : (
                <img src="/Audio_file.png" alt="Default Placeholder" />
                )}
            </div>
            
            <div
              className="delete-icon"
              onClick={(e) => {
                e.stopPropagation(); // 阻止事件冒泡
                handleDelete(item);
              }}
            >
              ❌
            </div>
            <p className="media-name">{item.file_name}</p>
            <div className="permission-switch">
                <span>Permission:</span>
                <Switch
                checked={item.permissions === "public"}
                onChange={(checked) => updatePermission(item, checked)}
                checkedChildren="Public"
                unCheckedChildren="Private"
                />
            </div>
            {/* 条件渲染悬停消息框 */}
            {hoveredItem === item && (
                <div className="hover-message">
                    <p>Type: {item.file_type}</p>
                    <p>Name: {item.file_name}</p>
                    <p>Size: {item.file_size}</p>
                    <p>Permission: {item.permissions}</p>
                    <p>Uploader: {item.user_name}</p>
                    <p>Upload Time: {item.upload_date}</p>
                </div>
            )}
          </div>
        ))
        )}
      </div>

      
      <button className="add-button" onClick={() => setShowForm(true)}>+</button>
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Upload File</h2>
            <form onSubmit={handleFormSubmit}>
              {/* 文件上传 */}
              <div className="form-group">
                <label htmlFor="file">Select File:</label>
                <input
                  type="file"
                  id="file"
                  placeholder="select a file"
                  onChange={handleFileChange}
                  required
                />
              </div>

              {/* 文件类型 */}
              <div className="form-group">
                <label>File Type:</label>
                <input
                  type="text"
                  value={fileData.fileType}
                  readOnly
                  placeholder="auto fill"
                />
              </div>

              {/* 文件大小 */}
              <div className="form-group">
                <label>File Size:</label>
                <input
                  type="text"
                  value={fileData.fileSize}
                  readOnly
                  placeholder="auto compute"
                />
              </div>

              {/* 文件名字 */}
              <div className="form-group">
                <label>File Name:</label>
                <input
                  type="text"
                  value={fileData.fileName}
                  readOnly
                  placeholder="auto fill"
                />
              </div>

              {/* 文件权限 */}
              <div className="form-group">
                <label>Permission:</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="permission"
                      value="public"
                      checked={fileData.permission === "public"}
                      onChange={handlePermissionChange}
                    />
                    Public
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="permission"
                      value="private"
                      checked={fileData.permission === "private"}
                      onChange={handlePermissionChange}
                    />
                    Private
                  </label>
                </div>
              </div>

              {/* 确认按钮 */}
              <button type="submit" className="submit-button">
                Upload
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPage;